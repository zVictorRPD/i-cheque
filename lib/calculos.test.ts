import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  calcularAdiamento,
  calcularCadastro,
  parseNumeroBr,
  porcentagemParaCentesimos,
  reaisParaCentavos,
  RegraNegocioError,
} from "./calculos"
import { mascaraReais } from "./formatacao"

function cadastro(
  recebimento: string,
  vencimento: string,
  juros: number,
  face: number
) {
  return calcularCadastro({
    dataRecebimento: recebimento,
    dataVencimento: vencimento,
    jurosAoMesCentesimos: porcentagemParaCentesimos(juros),
    valorFaceCentavos: reaisParaCentavos(face),
  })
}

describe("máscara de reais", () => {
  it("preenche os centavos da direita para a esquerda", () => {
    assert.equal(mascaraReais("1"), "R$ 0,01")
    assert.equal(mascaraReais("100000"), "R$ 1.000,00")
    assert.equal(parseNumeroBr(mascaraReais("100000")), 1000)
  })
})

describe("cadastro", () => {
  it("cobra 2 meses de janeiro a março", () => {
    const resultado = cadastro("2026-01-10", "2026-03-10", 5, 1000)
    assert.equal(resultado.meses, 2)
    assert.equal(resultado.jurosTotalCentesimos, 1000)
    assert.equal(resultado.valorPagoCentavos, 90000)
    assert.equal(resultado.lucroCentavos, 10000)
  })

  it("ignora o dia ao contar os meses", () => {
    const resultado = cadastro("2026-01-31", "2026-03-01", 5, 1000)
    assert.equal(resultado.meses, 2)
    assert.equal(resultado.valorPagoCentavos, 90000)
  })

  it("conta o mesmo mês civil como 1 mês", () => {
    const resultado = cadastro("2026-01-02", "2026-01-20", 5, 1000)
    assert.equal(resultado.meses, 1)
    assert.equal(resultado.valorPagoCentavos, 95000)
    assert.equal(resultado.lucroCentavos, 5000)
  })

  it("atravessa o ano", () => {
    const resultado = cadastro("2026-12-01", "2027-01-01", 5, 2000)
    assert.equal(resultado.meses, 1)
    assert.equal(resultado.valorPagoCentavos, 190000)
    assert.equal(resultado.lucroCentavos, 10000)
  })

  it("cobra 12 meses em um ano", () => {
    const resultado = cadastro("2026-06-15", "2027-06-15", 2, 500)
    assert.equal(resultado.meses, 12)
    assert.equal(resultado.jurosTotalCentesimos, 2400)
    assert.equal(resultado.valorPagoCentavos, 38000)
    assert.equal(resultado.lucroCentavos, 12000)
  })

  it("recusa vencimento no dia do recebimento", () => {
    assert.throws(
      () => cadastro("2026-01-10", "2026-01-10", 5, 1000),
      RegraNegocioError
    )
  })

  it("recusa juros totais de 100%", () => {
    assert.throws(
      () => cadastro("2026-01-01", "2026-02-01", 100, 1000),
      RegraNegocioError
    )
  })
})

describe("adiamento", () => {
  const base = {
    valorFaceCentavos: reaisParaCentavos(1000),
    jurosAoMesCentesimos: porcentagemParaCentesimos(5),
  }

  it("soma 1 mês e R$ 50 ao adiar para o mês seguinte", () => {
    const resultado = calcularAdiamento({
      ...base,
      vencimentoAtual: "2026-03-10",
      novoVencimento: "2026-04-10",
    })
    assert.equal(resultado.meses, 1)
    assert.equal(resultado.lucroCentavos, 5000)
  })

  it("soma 2 meses ao pular dois meses civis", () => {
    const resultado = calcularAdiamento({
      ...base,
      vencimentoAtual: "2026-04-10",
      novoVencimento: "2026-06-10",
    })
    assert.equal(resultado.meses, 2)
    assert.equal(resultado.lucroCentavos, 10000)
  })

  it("conta nova data no mesmo mês como 1 mês", () => {
    const resultado = calcularAdiamento({
      ...base,
      vencimentoAtual: "2026-06-10",
      novoVencimento: "2026-06-25",
    })
    assert.equal(resultado.meses, 1)
    assert.equal(resultado.lucroCentavos, 5000)
  })

  it("recusa data anterior ao vencimento atual", () => {
    assert.throws(
      () =>
        calcularAdiamento({
          ...base,
          vencimentoAtual: "2026-06-10",
          novoVencimento: "2026-06-09",
        }),
      RegraNegocioError
    )
  })
})
