import { statusCheque, type StatusCheque } from "@/lib/db/schema"

export const rotuloStatus: Record<StatusCheque, string> = {
  pendente: "Pendente",
  adiado: "Adiado",
  recebido: "Recebido",
  devolvido: "Devolvido",
}

export const classeStatus: Record<StatusCheque, string> = {
  pendente: "bg-muted text-foreground",
  adiado: "bg-amber-500 text-amber-950",
  recebido: "bg-emerald-600 text-white dark:bg-emerald-500",
  devolvido: "bg-red-600 text-white",
}

export function emAberto(status: StatusCheque) {
  return status === "pendente" || status === "adiado"
}

export function lerStatusFiltro(valor: string | string[] | undefined) {
  const bruto = Array.isArray(valor) ? valor.join(",") : (valor ?? "")
  const escolhidos = new Set(
    bruto
      .split(",")
      .map((parte) => parte.trim())
      .filter((parte) => (statusCheque as readonly string[]).includes(parte))
  )
  return statusCheque.filter((status) => escolhidos.has(status))
}

export function lerOrdemData(valor: string | string[] | undefined) {
  const bruto = Array.isArray(valor) ? valor[0] : valor
  return bruto === "desc" ? "desc" : "asc"
}
