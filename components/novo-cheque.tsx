"use client"

import { useState } from "react"
import { toast } from "sonner"
import { criarCheque } from "@/app/acoes/cheques"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mascaraReais } from "@/lib/formatacao"

export function NovoCheque() {
  const [aberto, setAberto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [valor, setValor] = useState("")

  return (
    <Dialog
      open={aberto}
      onOpenChange={(proximo) => {
        setAberto(proximo)
        if (!proximo) setValor("")
      }}
    >
      <DialogTrigger render={<Button className="h-11" />}>
        Novo cheque
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo cheque</DialogTitle>
          <DialogDescription>
            O valor pago e o lucro são calculados pelos meses civis e pelos
            juros ao mês.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = event.currentTarget
            setEnviando(true)
            const resultado = await criarCheque(new FormData(form))
            setEnviando(false)
            if (!resultado.ok) {
              toast.error(resultado.error)
              return
            }
            form.reset()
            setValor("")
            toast.success("Cheque cadastrado.")
            setAberto(false)
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="nome">Nome no cheque</Label>
            <Input id="nome" name="nome" className="h-11" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="valor">Valor de face</Label>
            <Input
              id="valor"
              name="valor"
              inputMode="numeric"
              autoComplete="off"
              placeholder="R$ 0,00"
              className="h-11"
              value={valor}
              onChange={(event) => setValor(mascaraReais(event.target.value))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataRecebimento">Recebimento</Label>
              <Input
                id="dataRecebimento"
                name="dataRecebimento"
                type="date"
                className="h-11"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataVencimento">Vencimento</Label>
              <Input
                id="dataVencimento"
                name="dataVencimento"
                type="date"
                className="h-11"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="jurosAoMes">Juros ao mês (%)</Label>
            <Input
              id="jurosAoMes"
              name="jurosAoMes"
              inputMode="decimal"
              placeholder="5"
              className="h-11"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="h-11" disabled={enviando}>
              {enviando ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
