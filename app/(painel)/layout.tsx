import { AppShell } from "@/components/app-shell"
import { exigirUsuario } from "@/lib/sessao"

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await exigirUsuario()

  return <AppShell nome={usuario.name}>{children}</AppShell>
}
