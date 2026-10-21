"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  calcularAdiamento,
  calcularCadastro,
  parseNumeroBr,
  porcentagemParaCentesimos,
  reaisParaCentavos,
  RegraNegocioError,
} from "@/lib/calculos"
import { db } from "@/lib/db"
import { adiamento, cheque, type StatusCheque } from "@/lib/db/schema"
import { obterSessao } from "@/lib/sessao"

type Resultado = { ok: true } | { ok: false; error: string }

const cadastroSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome que consta no cheque."),
  valor: z.string().trim().min(1, "Informe o valor do cheque."),
  dataRecebimento: z.string().trim().min(1, "Informe a data de recebimento."),
  dataVencimento: z.string().trim().min(1, "Informe a data de vencimento."),
  jurosAoMes: z.string().trim().min(1, "Informe os juros ao mês."),
})

function falha(error: unknown): Resultado {
  if (error instanceof RegraNegocioError || error instanceof z.ZodError) {
    const mensagem =
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Dados inválidos.")
        : error.message
    return { ok: false, error: mensagem }
  }
  console.error(error)
  return { ok: false, error: "Não foi possível concluir. Tente de novo." }
}

async function usuarioAtual() {
  const sessao = await obterSessao()
  if (!sessao) {
    throw new RegraNegocioError("Entre na sua conta para continuar.")
  }
  return sessao.user
}

function atualizarTelas() {
  revalidatePath("/dashboard")
  revalidatePath("/cheques")
}

async function buscarCheque(id: string, userId: string) {
  const [atual] = await db
    .select()
    .from(cheque)
    .where(and(eq(cheque.id, id), eq(cheque.userId, userId)))
  return atual
}

export async function criarCheque(formData: FormData): Promise<Resultado> {
  try {
    const usuario = await usuarioAtual()
    const dados = cadastroSchema.parse({
      nome: formData.get("nome"),
      valor: formData.get("valor"),
      dataRecebimento: formData.get("dataRecebimento"),
      dataVencimento: formData.get("dataVencimento"),
      jurosAoMes: formData.get("jurosAoMes"),
    })
    const valorFaceCentavos = reaisParaCentavos(parseNumeroBr(dados.valor))
    const jurosAoMesCentesimos = porcentagemParaCentesimos(
      parseNumeroBr(dados.jurosAoMes)
    )
    const calculado = calcularCadastro({
      valorFaceCentavos,
      dataRecebimento: dados.dataRecebimento,
      dataVencimento: dados.dataVencimento,
      jurosAoMesCentesimos,
    })

    await db.insert(cheque).values({
      id: crypto.randomUUID(),
      userId: usuario.id,
      nomeNoCheque: dados.nome,
      valorFaceCentavos,
      dataRecebimento: dados.dataRecebimento,
      dataVencimentoOriginal: dados.dataVencimento,
      dataVencimentoAtual: dados.dataVencimento,
      jurosAoMesCentesimos,
      mesesOriginais: calculado.meses,
      mesesAdiados: 0,
      jurosTotalCentesimos: calculado.jurosTotalCentesimos,
      valorPagoCentavos: calculado.valorPagoCentavos,
      lucroOriginalCentavos: calculado.lucroCentavos,
      lucroAdiamentosCentavos: 0,
      lucroTotalCentavos: calculado.lucroCentavos,
      status: "pendente",
    })
    atualizarTelas()
    return { ok: true }
  } catch (error) {
    return falha(error)
  }
}

async function mudarStatus(
  id: string,
  proximo: StatusCheque
): Promise<Resultado> {
  try {
    const usuario = await usuarioAtual()
    const atual = await buscarCheque(id, usuario.id)
    if (!atual) {
      return { ok: false, error: "Cheque não encontrado." }
    }
    if (atual.status === proximo) {
      return { ok: true }
    }
    await db
      .update(cheque)
      .set({ status: proximo })
      .where(eq(cheque.id, atual.id))
    atualizarTelas()
    return { ok: true }
  } catch (error) {
    return falha(error)
  }
}

export async function marcarPendente(id: string) {
  return mudarStatus(id, "pendente")
}

export async function marcarRecebido(id: string) {
  return mudarStatus(id, "recebido")
}

export async function marcarDevolvido(id: string) {
  return mudarStatus(id, "devolvido")
}

export async function adiarCheque(
  id: string,
  novoVencimento: string
): Promise<Resultado> {
  try {
    const usuario = await usuarioAtual()
    const atual = await buscarCheque(id, usuario.id)
    if (!atual) {
      return { ok: false, error: "Cheque não encontrado." }
    }
    const extra = calcularAdiamento({
      valorFaceCentavos: atual.valorFaceCentavos,
      jurosAoMesCentesimos: atual.jurosAoMesCentesimos,
      vencimentoAtual: atual.dataVencimentoAtual,
      novoVencimento,
    })
    const mesesAdiados = atual.mesesAdiados + extra.meses
    const lucroAdiamentosCentavos =
      atual.lucroAdiamentosCentavos + extra.lucroCentavos

    await db.transaction(async (tx) => {
      await tx.insert(adiamento).values({
        id: crypto.randomUUID(),
        chequeId: atual.id,
        vencimentoAnterior: atual.dataVencimentoAtual,
        vencimentoNovo: novoVencimento,
        meses: extra.meses,
        jurosAoMesCentesimos: atual.jurosAoMesCentesimos,
        lucroCentavos: extra.lucroCentavos,
      })
      await tx
        .update(cheque)
        .set({
          status: "adiado",
          dataVencimentoAtual: novoVencimento,
          mesesAdiados,
          lucroAdiamentosCentavos,
          lucroTotalCentavos:
            atual.lucroOriginalCentavos + lucroAdiamentosCentavos,
          jurosTotalCentesimos:
            (atual.mesesOriginais + mesesAdiados) * atual.jurosAoMesCentesimos,
        })
        .where(eq(cheque.id, atual.id))
    })
    atualizarTelas()
    return { ok: true }
  } catch (error) {
    return falha(error)
  }
}

export async function excluirCheque(id: string): Promise<Resultado> {
  try {
    const usuario = await usuarioAtual()
    const atual = await buscarCheque(id, usuario.id)
    if (!atual) {
      return { ok: false, error: "Cheque não encontrado." }
    }
    await db.delete(adiamento).where(eq(adiamento.chequeId, atual.id))
    await db.delete(cheque).where(eq(cheque.id, atual.id))
    atualizarTelas()
    return { ok: true }
  } catch (error) {
    return falha(error)
  }
}
