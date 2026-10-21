import { redirect } from "next/navigation"
import { FormularioEntrar } from "@/components/formularios-conta"
import { obterSessao } from "@/lib/sessao"

export default async function LoginPage() {
  if (await obterSessao()) {
    redirect("/dashboard")
  }
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse os cheques da sua conta.
        </p>
      </div>
      <FormularioEntrar />
    </section>
  )
}
