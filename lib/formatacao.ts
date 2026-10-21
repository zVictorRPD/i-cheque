export function mascaraReais(texto: string) {
  const numeros = texto.replace(/\D/g, "").slice(0, 13)
  if (!numeros) return ""
  const preenchido = numeros.padStart(3, "0")
  const centavos = preenchido.slice(-2)
  const inteiro = preenchido.slice(0, -2).replace(/^0+(?=\d)/, "")
  const comPontos = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `R$ ${comPontos},${centavos}`
}

export function formatarReais(centavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100)
}

export function formatarPorcentagem(centesimos: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(centesimos / 100)}%`
}

export function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-")
  return `${dia}/${mes}/${ano}`
}

export function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data)
}

export function diaSeguinte(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, dia + 1))
  const mesNovo = String(data.getUTCMonth() + 1).padStart(2, "0")
  const diaNovo = String(data.getUTCDate()).padStart(2, "0")
  return `${data.getUTCFullYear()}-${mesNovo}-${diaNovo}`
}
export function hojeIso() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, "0")
  const dia = String(agora.getDate()).padStart(2, "0")
  return `${agora.getFullYear()}-${mes}-${dia}`
}
