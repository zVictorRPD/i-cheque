import { ChequeCard } from "@/components/cheque-card"
import { NovoCheque } from "@/components/novo-cheque"
import { listarCheques } from "@/lib/cheques"
import { exigirUsuario } from "@/lib/sessao"

export default async function ChequesPage() {
  const usuario = await exigirUsuario()
  const cheques = await listarCheques(usuario.id)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium">Cheques</h1>
          <p className="text-sm text-muted-foreground">
            {cheques.length === 0
              ? "Nenhum cheque cadastrado."
              : `${cheques.length} ${cheques.length === 1 ? "cheque" : "cheques"}, do vencimento mais próximo ao mais distante.`}
          </p>
        </div>
        <NovoCheque />
      </div>
      {cheques.length === 0 ? (
        <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-foreground/10">
          Cadastre o primeiro cheque para ver o valor pago e o lucro.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {cheques.map((cheque) => (
            <ChequeCard key={cheque.id} cheque={cheque} />
          ))}
        </div>
      )}
    </>
  )
}
