import Link from "next/link"
import { FormularioRedefinir } from "@/components/formularios-conta"

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams
  const tokenInvalido = !token || error === "INVALID_TOKEN"

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium">Nova senha</h1>
        <p className="text-sm text-muted-foreground">
          {tokenInvalido
            ? "Esse link expirou ou não é válido."
            : "Escolha uma senha nova para a sua conta."}
        </p>
      </div>
      {tokenInvalido ? (
        <Link
          href="/recuperar-senha"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Pedir outro link
        </Link>
      ) : (
        <FormularioRedefinir token={token} />
      )}
    </section>
  )
}
