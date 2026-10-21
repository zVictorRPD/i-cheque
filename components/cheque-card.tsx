"use client"

import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"
import {
  adiarCheque,
  excluirCheque,
  marcarDevolvido,
  marcarPendente,
  marcarRecebido,
} from "@/app/acoes/cheques"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ChequeItem } from "@/lib/cheques"
import { emAberto } from "@/lib/status"
import {
  formatarData,
  formatarDataHora,
  formatarPorcentagem,
  formatarReais,
  hojeIso,
} from "@/lib/formatacao"
import { cn } from "@/lib/utils"

const statusTexto = {
  pendente: "Pendente",
  adiado: "Adiado",
  recebido: "Recebido",
  devolvido: "Devolvido",
} as const

const statusClasse = {
  pendente: "bg-muted text-foreground",
  adiado: "bg-amber-500 text-amber-950",
  recebido: "bg-emerald-600 text-white dark:bg-emerald-500",
  devolvido: "bg-red-600 text-white",
} as const

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  )
}

export function ChequeCard({ cheque }: { cheque: ChequeItem }) {
  const [aberto, setAberto] = useState(false)
  const [adiando, setAdiando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const vencido =
    emAberto(cheque.status) && cheque.dataVencimentoAtual < hojeIso()

  async function executar(
    acao: () => Promise<{ ok: true } | { ok: false; error: string }>,
    sucesso: string
  ) {
    setOcupado(true)
    const resultado = await acao()
    setOcupado(false)
    if (!resultado.ok) {
      toast.error(resultado.error)
      return false
    }
    toast.success(sucesso)
    return true
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
      >
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-medium">
            {cheque.nomeNoCheque}
          </h2>
          <p className="text-muted-foreground">
            {formatarReais(cheque.valorFaceCentavos)}
          </p>
          {aberto ? null : (
            <p
              className={vencido ? "text-destructive" : "text-muted-foreground"}
            >
              {formatarData(cheque.dataVencimentoAtual)}
            </p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex h-6 shrink-0 items-center rounded-full px-2 text-xs font-medium",
            statusClasse[cheque.status]
          )}
        >
          {statusTexto[cheque.status]}
        </span>
        <ChevronDownIcon
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            aberto && "rotate-180"
          )}
        />
      </button>

      {aberto ? (
        <>
          {vencido ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive">
              Vencido em {formatarData(cheque.dataVencimentoAtual)} e ainda em
              aberto.
            </p>
          ) : null}

          <dl className="flex flex-col gap-2">
            <Linha
              rotulo="Recebimento"
              valor={formatarData(cheque.dataRecebimento)}
            />
            <Linha
              rotulo="Vencimento original"
              valor={formatarData(cheque.dataVencimentoOriginal)}
            />
            <Linha
              rotulo="Vencimento atual"
              valor={formatarData(cheque.dataVencimentoAtual)}
            />
            <Linha
              rotulo="Juros ao mês"
              valor={formatarPorcentagem(cheque.jurosAoMesCentesimos)}
            />
            <Linha
              rotulo="Meses originais"
              valor={String(cheque.mesesOriginais)}
            />
            <Linha rotulo="Meses adiados" valor={String(cheque.mesesAdiados)} />
            <Linha
              rotulo="Juros totais"
              valor={formatarPorcentagem(cheque.jurosTotalCentesimos)}
            />
            <Linha
              rotulo="Valor pago"
              valor={formatarReais(cheque.valorPagoCentavos)}
            />
            <Linha
              rotulo="Lucro original"
              valor={formatarReais(cheque.lucroOriginalCentavos)}
            />
            <Linha
              rotulo="Lucro dos adiamentos"
              valor={formatarReais(cheque.lucroAdiamentosCentavos)}
            />
            <Linha
              rotulo="Lucro total"
              valor={formatarReais(cheque.lucroTotalCentavos)}
            />
          </dl>

          {cheque.adiamentos.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Histórico de adiamentos</h3>
              <ul className="flex flex-col gap-2">
                {cheque.adiamentos.map((item) => (
                  <li key={item.id} className="rounded-lg bg-muted px-3 py-2">
                    <p>
                      {formatarData(item.vencimentoAnterior)} para{" "}
                      {formatarData(item.vencimentoNovo)}
                    </p>
                    <p className="text-muted-foreground">
                      {item.meses} {item.meses === 1 ? "mês" : "meses"} ·{" "}
                      {formatarReais(item.lucroCentavos)} ·{" "}
                      {formatarDataHora(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {cheque.status !== "pendente" ? (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={ocupado}
                onClick={() =>
                  executar(
                    () => marcarPendente(cheque.id),
                    "Cheque marcado como pendente."
                  )
                }
              >
                Marcar como pendente
              </Button>
            ) : null}
            {cheque.status !== "recebido" ? (
              <Button
                type="button"
                className="h-11"
                disabled={ocupado}
                onClick={() =>
                  executar(
                    () => marcarRecebido(cheque.id),
                    "Cheque marcado como recebido."
                  )
                }
              >
                Marcar como recebido
              </Button>
            ) : null}
            {cheque.status !== "devolvido" ? (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={ocupado}
                onClick={() =>
                  executar(
                    () => marcarDevolvido(cheque.id),
                    "Cheque marcado como devolvido."
                  )
                }
              >
                Marcar como devolvido
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={ocupado}
              onClick={() => setAdiando(true)}
            >
              Adiar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11"
              disabled={ocupado}
              onClick={() => setExcluindo(true)}
            >
              Excluir
            </Button>
          </div>
        </>
      ) : null}

      <Dialog open={adiando} onOpenChange={setAdiando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adiar vencimento</DialogTitle>
            <DialogDescription>
              Vencimento atual: {formatarData(cheque.dataVencimentoAtual)}. A
              taxa continua {formatarPorcentagem(cheque.jurosAoMesCentesimos)}{" "}
              ao mês sobre o valor de face.
            </DialogDescription>
          </DialogHeader>
          <form
            key={adiando ? cheque.dataVencimentoAtual : "fechado"}
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault()
              const novaData = String(
                new FormData(event.currentTarget).get("novoVencimento")
              )
              const ok = await executar(
                () => adiarCheque(cheque.id, novaData),
                "Vencimento adiado."
              )
              if (ok) setAdiando(false)
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor={`novo-${cheque.id}`}>Novo vencimento</Label>
              <Input
                id={`novo-${cheque.id}`}
                name="novoVencimento"
                type="date"
                defaultValue={cheque.dataVencimentoAtual}
                min={cheque.dataVencimentoAtual}
                className="h-11"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="h-11" disabled={ocupado}>
                Confirmar adiamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={excluindo} onOpenChange={setExcluindo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cheque</DialogTitle>
            <DialogDescription>
              {cheque.nomeNoCheque} e o histórico de adiamentos serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              className="h-11"
              disabled={ocupado}
              onClick={async () => {
                const ok = await executar(
                  () => excluirCheque(cheque.id),
                  "Cheque excluído."
                )
                if (ok) setExcluindo(false)
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}
