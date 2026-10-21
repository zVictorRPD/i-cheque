export class RegraNegocioError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RegraNegocioError"
  }
}

const ESCALA_JUROS = 10_000

export function dividirMeioParaCima(numerador: number, denominador: number) {
  return Math.floor((numerador + Math.floor(denominador / 2)) / denominador)
}

export function reaisParaCentavos(reais: number) {
  if (!Number.isFinite(reais)) {
    throw new RegraNegocioError("Valor inválido.")
  }
  return Math.round(reais * 100)
}

export function porcentagemParaCentesimos(porcentagem: number) {
  if (!Number.isFinite(porcentagem)) {
    throw new RegraNegocioError("Juros inválidos.")
  }
  return Math.round(porcentagem * 100)
}

export function parseNumeroBr(texto: string) {
  const limpo = texto.trim().replace(/R\$/g, "").replace(/\s/g, "")
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo
  const valor = Number(normalizado)
  if (!limpo || !Number.isFinite(valor)) {
    throw new RegraNegocioError("Número inválido.")
  }
  return valor
}

export function parseDataIso(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) {
    throw new RegraNegocioError("Data inválida.")
  }
  const ano = Number(match[1])
  const mes = Number(match[2])
  const dia = Number(match[3])
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    throw new RegraNegocioError("Data inválida.")
  }
  return { ano, mes, dia }
}

export function mesesCivis(inicio: string, fim: string) {
  const a = parseDataIso(inicio)
  const b = parseDataIso(fim)
  const meses = (b.ano - a.ano) * 12 + (b.mes - a.mes)
  return meses < 1 ? 1 : meses
}

export function calcularCadastro(input: {
  valorFaceCentavos: number
  dataRecebimento: string
  dataVencimento: string
  jurosAoMesCentesimos: number
}) {
  if (input.valorFaceCentavos <= 0) {
    throw new RegraNegocioError("O valor do cheque precisa ser maior que zero.")
  }
  if (input.jurosAoMesCentesimos <= 0) {
    throw new RegraNegocioError(
      "Os juros ao mês precisam ser maiores que zero."
    )
  }
  parseDataIso(input.dataRecebimento)
  parseDataIso(input.dataVencimento)
  if (input.dataVencimento <= input.dataRecebimento) {
    throw new RegraNegocioError(
      "A data de vencimento precisa ser posterior à data de recebimento."
    )
  }

  const meses = mesesCivis(input.dataRecebimento, input.dataVencimento)
  const jurosTotalCentesimos = meses * input.jurosAoMesCentesimos
  if (jurosTotalCentesimos >= ESCALA_JUROS) {
    throw new RegraNegocioError(
      "Os juros totais precisam ficar abaixo de 100% para o valor pago continuar positivo."
    )
  }

  const valorPagoCentavos = dividirMeioParaCima(
    input.valorFaceCentavos * (ESCALA_JUROS - jurosTotalCentesimos),
    ESCALA_JUROS
  )
  return {
    meses,
    jurosTotalCentesimos,
    valorPagoCentavos,
    lucroCentavos: input.valorFaceCentavos - valorPagoCentavos,
  }
}

export function calcularAdiamento(input: {
  valorFaceCentavos: number
  jurosAoMesCentesimos: number
  vencimentoAtual: string
  novoVencimento: string
}) {
  parseDataIso(input.vencimentoAtual)
  parseDataIso(input.novoVencimento)
  if (input.novoVencimento <= input.vencimentoAtual) {
    throw new RegraNegocioError(
      "A nova data precisa ser posterior ao vencimento atual."
    )
  }

  const meses = mesesCivis(input.vencimentoAtual, input.novoVencimento)
  const lucroCentavos = dividirMeioParaCima(
    input.valorFaceCentavos * meses * input.jurosAoMesCentesimos,
    ESCALA_JUROS
  )
  return { meses, lucroCentavos }
}
