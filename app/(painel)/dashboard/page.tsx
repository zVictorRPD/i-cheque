import Link from "next/link"
import { FiltroAbertos } from "@/components/filtro-abertos"
import { listarCheques } from "@/lib/cheques"
import { formatarData, formatarReais, hojeIso } from "@/lib/formatacao"
import { exigirUsuario } from "@/lib/sessao"
import { emAberto } from "@/lib/status"
import { cn } from "@/lib/utils"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ abertos?: string }>
}) {
  const usuario = await exigirUsuario()
  const { abertos } = await searchParams
  const somenteAbertos = abertos === "1"
  const cheques = await listarCheques(usuario.id)
  const considerados = somenteAbertos
    ? cheques.filter((cheque) => emAberto(cheque.status))
    : cheques
  const hoje = hojeIso()
  const pendentes = cheques.filter((cheque) => emAberto(cheque.status))
  const vencidos = pendentes.filter(
    (cheque) => cheque.dataVencimentoAtual < hoje
  )
  const dinheiroNaRua = pendentes.reduce(
    (total, cheque) => total + cheque.valorPagoCentavos,
    0
  )
  const proximos = pendentes
    .filter((cheque) => cheque.dataVencimentoAtual >= hoje)
    .sort((a, b) => a.dataVencimentoAtual.localeCompare(b.dataVencimentoAtual))
    .slice(0, 5)
  const bruto = considerados.reduce(
    (total, cheque) => total + cheque.valorFaceCentavos,
    0
  )
  const lucro = considerados.reduce(
    (total, cheque) => total + cheque.lucroTotalCentavos,
    0
  )

  const indicadores = [
    { rotulo: "Dinheiro na rua", valor: formatarReais(dinheiroNaRua) },
    {
      rotulo: "Cheques vencidos",
      valor: String(vencidos.length),
      destaque: vencidos.length > 0,
    },
    { rotulo: "Valor bruto emprestado", valor: formatarReais(bruto) },
    { rotulo: "Valor líquido de lucro", valor: formatarReais(lucro) },
    { rotulo: "Total de empréstimos", valor: String(considerados.length) },
    { rotulo: "Empréstimos pendentes", valor: String(pendentes.length) },
  ]

  return (
    <>
      <div>
        <h1 className="text-xl font-medium">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Olá, {usuario.name.split(" ")[0]}.
        </p>
      </div>
      <FiltroAbertos ativo={somenteAbertos} />
      <div className="grid grid-cols-2 gap-3">
        {indicadores.map((item) => (
          <section
            key={item.rotulo}
            className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <p className="text-xs text-muted-foreground">{item.rotulo}</p>
            <p
              className={cn(
                "text-lg font-medium",
                "destaque" in item && item.destaque && "text-destructive"
              )}
            >
              {item.valor}
            </p>
          </section>
        ))}
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Próximos cheques a vencer</h2>
        {proximos.length === 0 ? (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-foreground/10">
            Nenhum cheque a vencer.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {proximos.map((cheque) => (
              <li key={cheque.id}>
                <Link
                  href="/cheques"
                  className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {cheque.nomeNoCheque}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatarData(cheque.dataVencimentoAtual)}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatarReais(cheque.valorFaceCentavos)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
