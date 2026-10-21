"use client"

import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function FiltroAbertos({ ativo }: { ativo: boolean }) {
  const router = useRouter()

  return (
    <Label className="h-11 justify-between rounded-xl bg-card px-3 ring-1 ring-foreground/10">
      Somente em aberto
      <Switch
        checked={ativo}
        onCheckedChange={(marcado) => {
          router.push(marcado ? "/dashboard?abertos=1" : "/dashboard")
        }}
      />
    </Label>
  )
}
