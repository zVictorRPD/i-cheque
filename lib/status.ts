import type { StatusCheque } from "@/lib/db/schema"

export function emAberto(status: StatusCheque) {
  return status === "pendente" || status === "adiado"
}
