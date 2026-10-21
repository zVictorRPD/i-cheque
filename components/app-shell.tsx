"use client"

import { LayoutDashboardIcon, ReceiptIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlternarTema } from "@/components/alternar-tema"
import { Logo } from "@/components/logo"
import { Sair } from "@/components/sair"
import { cn } from "@/lib/utils"

const itens = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/cheques", label: "Cheques", icon: ReceiptIcon },
]

export function AppShell({
  nome,
  children,
}: {
  nome: string
  children: React.ReactNode
}) {
  const caminho = usePathname()
  return (
    <div className="min-h-svh pb-24">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="min-w-0 flex-1">
            <Logo priority className="h-10 w-auto" />
          </Link>
          <p className="hidden max-w-40 truncate text-sm text-muted-foreground sm:block">
            {nome}
          </p>
          <AlternarTema />
          <Sair />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background">
        <div className="mx-auto grid w-full max-w-2xl grid-cols-2">
          {itens.map((item) => {
            const ativo = caminho === item.href
            const Icone = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                  ativo ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icone />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
