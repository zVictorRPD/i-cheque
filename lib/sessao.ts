import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function obterSessao() {
  return auth.api.getSession({ headers: await headers() })
}

export async function exigirUsuario() {
  const sessao = await obterSessao()
  if (!sessao) {
    redirect("/login")
  }
  return sessao.user
}
