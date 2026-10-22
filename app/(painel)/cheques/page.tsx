import { ListaCheques } from "@/components/lista-cheques"
import { NovoCheque } from "@/components/novo-cheque"
import { listarCheques } from "@/lib/cheques"
import { exigirUsuario } from "@/lib/sessao"
import { lerOrdemData, lerStatusFiltro } from "@/lib/status"

export default async function ChequesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[]
    ordem?: string | string[]
  }>
}) {
  const usuario = await exigirUsuario()
  const params = await searchParams
  const cheques = await listarCheques(usuario.id)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium">Cheques</h1>
          <p className="text-sm text-muted-foreground">
            {cheques.length === 0
              ? "Nenhum cheque cadastrado."
              : `${cheques.length} ${cheques.length === 1 ? "cheque" : "cheques"}`}
          </p>
        </div>
        <NovoCheque />
      </div>
      {cheques.length === 0 ? (
        <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-foreground/10">
          Cadastre o primeiro cheque para ver o valor pago e o lucro.
        </p>
      ) : (
        <ListaCheques
          cheques={cheques}
          statusAtivos={lerStatusFiltro(params.status)}
          ordem={lerOrdemData(params.ordem)}
        />
      )}
    </>
  )
}
