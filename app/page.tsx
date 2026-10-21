import { redirect } from "next/navigation"
import { obterSessao } from "@/lib/sessao"

export default async function HomePage() {
  const sessao = await obterSessao()
  redirect(sessao ? "/dashboard" : "/login")
}
