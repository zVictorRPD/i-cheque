import { redirect } from "next/navigation"
import { FormularioCadastro } from "@/components/formularios-conta"
import { obterSessao } from "@/lib/sessao"

export default async function CadastroPage() {
  if (await obterSessao()) {
    redirect("/dashboard")
  }
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Nome, e-mail e senha. Cada conta vê só os próprios cheques.
        </p>
      </div>
      <FormularioCadastro />
    </section>
  )
}
