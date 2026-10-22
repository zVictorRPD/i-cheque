"use client"

import { useRouter } from "next/navigation"
import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon } from "lucide-react"
import { ChequeCard } from "@/components/cheque-card"
import type { ChequeItem } from "@/lib/cheques"
import { statusCheque, type StatusCheque } from "@/lib/db/schema"
import { classeStatus, rotuloStatus } from "@/lib/status"
import { cn } from "@/lib/utils"

export function ListaCheques({
  cheques,
  statusAtivos,
  ordem,
}: {
  cheques: ChequeItem[]
  statusAtivos: StatusCheque[]
  ordem: "asc" | "desc"
}) {
  const router = useRouter()
  const filtroLigado = statusAtivos.length > 0
  const visiveis = cheques
    .filter((cheque) => !filtroLigado || statusAtivos.includes(cheque.status))
    .toSorted((a, b) => {
      const porData = a.dataVencimentoAtual.localeCompare(b.dataVencimentoAtual)
      if (porData !== 0) return ordem === "asc" ? porData : -porData
      return a.nomeNoCheque.localeCompare(b.nomeNoCheque, "pt-BR")
    })

  function atualizar(
    proximoStatus: StatusCheque[],
    proximaOrdem: "asc" | "desc"
  ) {
    const params = new URLSearchParams()
    if (proximoStatus.length > 0) {
      params.set("status", proximoStatus.join(","))
    }
    if (proximaOrdem === "desc") {
      params.set("ordem", "desc")
    }
    const consulta = params.toString()
    router.replace(consulta ? `/cheques?${consulta}` : "/cheques")
  }

  function alternarStatus(status: StatusCheque) {
    const proximo = statusAtivos.includes(status)
      ? statusAtivos.filter((item) => item !== status)
      : statusCheque.filter(
          (item) => statusAtivos.includes(item) || item === status
        )
    atualizar(proximo, ordem)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {statusCheque.map((status) => {
          const ativo = statusAtivos.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={statusAtivos.includes(status)}
              onClick={() => alternarStatus(status)}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium",
                ativo
                  ? classeStatus[status]
                  : "bg-transparent text-muted-foreground ring-1 ring-foreground/15"
              )}
            >
              {rotuloStatus[status]}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() =>
          atualizar(statusAtivos, ordem === "asc" ? "desc" : "asc")
        }
        className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-card px-3 text-xs font-medium ring-1 ring-foreground/10"
      >
        {ordem === "asc" ? (
          <ArrowDownNarrowWideIcon className="size-3.5" />
        ) : (
          <ArrowUpNarrowWideIcon className="size-3.5" />
        )}
        {ordem === "asc"
          ? "Vencimento mais próximo"
          : "Vencimento mais distante"}
      </button>
      {visiveis.length === 0 ? (
        <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-foreground/10">
          Nenhum cheque com os status escolhidos.
        </p>
      ) : (
        visiveis.map((cheque) => <ChequeCard key={cheque.id} cheque={cheque} />)
      )}
    </div>
  )
}
