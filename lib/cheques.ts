import { asc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { adiamento, cheque, type StatusCheque } from "@/lib/db/schema"

export type AdiamentoItem = {
  id: string
  vencimentoAnterior: string
  vencimentoNovo: string
  meses: number
  jurosAoMesCentesimos: number
  lucroCentavos: number
  createdAt: Date
}

export type ChequeItem = {
  id: string
  nomeNoCheque: string
  valorFaceCentavos: number
  dataRecebimento: string
  dataVencimentoOriginal: string
  dataVencimentoAtual: string
  jurosAoMesCentesimos: number
  mesesOriginais: number
  mesesAdiados: number
  jurosTotalCentesimos: number
  valorPagoCentavos: number
  lucroOriginalCentavos: number
  lucroAdiamentosCentavos: number
  lucroTotalCentavos: number
  status: StatusCheque
  adiamentos: AdiamentoItem[]
}

export async function listarCheques(userId: string) {
  const cheques = await db
    .select()
    .from(cheque)
    .where(eq(cheque.userId, userId))
    .orderBy(asc(cheque.dataVencimentoAtual), asc(cheque.createdAt))

  if (cheques.length === 0) {
    return [] satisfies ChequeItem[]
  }

  const historico = await db
    .select()
    .from(adiamento)
    .where(
      inArray(
        adiamento.chequeId,
        cheques.map((item) => item.id)
      )
    )
    .orderBy(asc(adiamento.createdAt))

  const porCheque = new Map<string, AdiamentoItem[]>()
  for (const item of historico) {
    const lista = porCheque.get(item.chequeId) ?? []
    lista.push(item)
    porCheque.set(item.chequeId, lista)
  }

  return cheques.map((item) => ({
    ...item,
    adiamentos: porCheque.get(item.id) ?? [],
  }))
}
