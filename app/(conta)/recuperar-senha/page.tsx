import { redirect } from "next/navigation"
import { FormularioRecuperar } from "@/components/formularios-conta"
import { obterSessao } from "@/lib/sessao"

export default async function RecuperarSenhaPage() {
  if (await obterSessao()) {
    redirect("/dashboard")
  }
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">
          Enviaremos um link para definir uma senha nova.
        </p>
      </div>
      <FormularioRecuperar />
    </section>
  )
}
