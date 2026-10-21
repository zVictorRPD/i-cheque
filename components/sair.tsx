"use client"

import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function Sair() {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11"
      aria-label="Sair"
      onClick={async () => {
        await authClient.signOut()
        router.push("/login")
        router.refresh()
      }}
    >
      <LogOutIcon />
    </Button>
  )
}
