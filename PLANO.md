# ICheque — Plano de produto

Documento de requisitos para implementação. Outro agente deve tratar este arquivo como a fonte das regras de negócio e da stack da seção 12.

## 1. Propósito

O ICheque gerencia empréstimos feitos por desconto de cheque.

Quem opera o sistema recebe um cheque de outra pessoa, paga a ela um valor menor que o valor de face e, no vencimento, recebe o valor cheio do cheque. A diferença é o lucro. Se o vencimento for adiado, o prazo extra gera juros novos, somados ao lucro, sem mudar o que já foi pago.

Exemplo canônico:

- Cheque de R$ 1.000,00
- Recebido em janeiro, vence em março
- Juros de 5% ao mês
- Prazo: 2 meses
- Juros totais: 10% (juros simples, não compostos)
- Valor pago à pessoa: R$ 900,00
- Lucro: R$ 100,00

## 2. Quem usa

Uma pessoa física que desconta cheques. Cada conta vê somente os próprios cheques. Não há papéis de administrador, equipe ou cliente final dentro do sistema. A pessoa nomeada no cheque é um dado do lançamento, não um usuário.

## 3. Escopo desta versão

Inclui:

- Criar conta, entrar, sair e recuperar senha
- Cadastrar cheque
- Excluir cheque, com confirmação
- Marcar cheque como recebido ou devolvido
- Adiar o vencimento, com histórico
- Ver os cheques em cards
- Ver um dashboard com os totais descritos abaixo
- Persistir os dados em banco
- Usar no celular por um APK instalado manualmente, sem publicação em loja

Fica de fora nesta versão:

- Editar valor, datas, juros ou nome depois do cadastro
- Notificações push
- Relatórios exportáveis
- Multiusuário na mesma conta
- Publicação na Play Store ou App Store

## 4. Telas

Duas telas principais. Cadastro, adiamento e confirmação de exclusão são fluxos abertos a partir da listagem (formulário ou modal), não abas novas.

### 4.1 Dashboard

Mostra sete informações e um switch.

O switch tem dois modos:

- Todos: padrão. Valor bruto, lucro e total de empréstimos usam todos os cheques da conta.
- Somente em aberto: esses três indicadores usam só cheques `pendente` e `adiado`.

| Indicador | Definição |
| --- | --- |
| Dinheiro na rua | Soma do valor pago nos cheques `pendente` e `adiado`. É o capital que saiu e ainda não voltou. Não muda com o switch. |
| Cheques vencidos | Quantidade de cheques `pendente` ou `adiado` cuja data de vencimento atual é anterior a hoje. Não muda com o switch. |
| Próximos cheques a vencer | Os 5 cheques `pendente` ou `adiado` que ainda não venceram, com a data de vencimento atual mais próxima. Se houver menos de 5, mostrar os que existirem. Cada item traz nome, vencimento atual e valor de face. O switch não altera esta lista. |
| Valor bruto emprestado | Soma do valor de face, respeitando o switch. |
| Valor líquido de lucro | Soma do lucro total de cada cheque, respeitando o switch. Lucro total = lucro do desconto original + lucro dos adiamentos. |
| Total de empréstimos | Quantidade de cheques, respeitando o switch. |
| Empréstimos pendentes | Quantidade de cheques `pendente` ou `adiado`. Não muda com o switch. |

### 4.2 Listagem

Lista em cards, pensada primeiro para celular. O card começa fechado e mostra nome, valor de face, status e vencimento atual. Ao expandir, mostra:

- Nome que consta no cheque
- Valor de face
- Data de recebimento
- Vencimento original
- Vencimento atual
- Porcentagem de juros ao mês
- Meses do prazo original
- Meses adiados (soma do histórico)
- Porcentagem total de juros (prazo original + adiamentos)
- Valor pago à pessoa
- Lucro do desconto original
- Lucro dos adiamentos
- Lucro total
- Status, com `devolvido` em vermelho
- Histórico de adiamentos: vencimento anterior, vencimento novo, meses, lucro daquele adiamento e data em que foi lançado

Ações do card, a partir de qualquer status. O botão do status atual fica oculto.

- Marcar como pendente
- Marcar como recebido
- Marcar como devolvido
- Adiar, que leva o status para `adiado`
- Excluir

Não há edição dos dados digitados no cadastro.

Cores de status, visíveis no claro e no escuro: pendente neutro, recebido verde, adiado âmbar, devolvido vermelho.

A interface tem modo claro, modo escuro e seguir o sistema. O padrão inicial é a preferência do sistema. O controle fica visível na interface. Implementar com next-themes, na estratégia de classe do shadcn.

Ícones da interface vêm do Lucide (`lucide-react`).

A logo do modo claro está em `icheque/logo.svg`, com "Cheque" em preto. A do modo escuro está em `icheque/logo-dark.svg`, com "Cheque" em branco. O "i" permanece verde. A interface troca as duas conforme o tema. O símbolo quadrado, para favicon e ícone do APK, está em `icheque/logo-mark.svg`.

### 4.3 Cadastro

Campos informados pelo usuário:

| Campo | Regra |
| --- | --- |
| Valor | Valor de face do cheque, em reais, maior que zero. |
| Data de recebimento | Dia em que o cheque foi pego. |
| Data de vencimento | Dia em que o cheque vence. Posterior à data de recebimento. |
| Juros ao mês | Porcentagem maior que zero. Ex.: 5 significa 5% ao mês. |
| Nome no cheque | Texto obrigatório. |

Valor pago, lucros, meses e juros totais são calculados e gravados. O usuário não os digita. O status inicial é `pendente`. Vencimento original e vencimento atual começam iguais.

### 4.4 Adiar

Disponível em qualquer status. Abre um modal com:

- Vencimento atual, somente leitura
- Nova data de vencimento, obrigatória e posterior ao vencimento atual

A taxa usada é a já gravada no cheque. O usuário não informa outra porcentagem. Ao confirmar, o sistema grava um item no histórico, passa o status para `adiado` e troca o vencimento atual pela data nova.

### 4.5 Excluir

Pede confirmação. Remove o cheque e o histórico de adiamentos dele.

## 5. Cálculo

Juros simples. O dia do mês não entra na conta. A diferença é de meses civis. Se essa diferença der menos de 1, conta 1 mês.

### 5.1 Cadastro

```
meses = (ano_vencimento - ano_recebimento) * 12 + (mes_vencimento - mes_recebimento)
se meses < 1: meses = 1
juros_total_percentual = meses * juros_ao_mes
valor_pago = valor_face * (1 - juros_total_percentual / 100)
lucro_original = valor_face - valor_pago
```

Exemplos de conferência:

| Recebimento | Vencimento | Juros ao mês | Meses | Juros totais | Face | Valor pago | Lucro |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10/01/2026 | 10/03/2026 | 5% | 2 | 10% | 1000 | 900 | 100 |
| 31/01/2026 | 01/03/2026 | 5% | 2 | 10% | 1000 | 900 | 100 |
| 02/01/2026 | 20/01/2026 | 5% | 1 | 5% | 1000 | 950 | 50 |
| 01/12/2026 | 01/01/2027 | 5% | 1 | 5% | 2000 | 1900 | 100 |
| 15/06/2026 | 15/06/2027 | 2% | 12 | 24% | 500 | 380 | 120 |

Arredondar dinheiro para 2 casas decimais (meio real para cima, padrão monetário). Guardar os valores calculados no cadastro.

Validações do cadastro:

- Valor de face > 0
- Juros ao mês > 0
- Data de vencimento posterior à data de recebimento
- Juros totais < 100, para o valor pago continuar positivo
- Nome preenchido

### 5.2 Adiamento

O valor pago não muda. O juro extra incide sobre o valor de face, com a mesma taxa mensal do cheque.

```
meses_extra = (ano_novo - ano_vencimento_atual) * 12 + (mes_novo - mes_vencimento_atual)
se meses_extra < 1: meses_extra = 1
lucro_deste_adiamento = valor_face * (meses_extra * juros_ao_mes / 100)
```

Depois de gravar:

- `meses_adiados` = soma dos meses de todos os adiamentos
- `lucro_adiamentos` = soma do lucro de todos os adiamentos
- `lucro_total` = `lucro_original` + `lucro_adiamentos`
- `juros_total_percentual` = (`meses_originais` + `meses_adiados`) * `juros_ao_mes`
- `data_vencimento_atual` = nova data
- status = `adiado`

Um adiamento pode fazer o juro acumulado passar de 100% da face. Isso é válido, porque o valor pago já foi definido no cadastro.

Exemplo: face R$ 1.000,00, 5% ao mês, prazo original janeiro–março, valor pago R$ 900,00, lucro original R$ 100,00.

| Ação | Vencimento anterior | Vencimento novo | Meses extras | Lucro deste adiamento | Lucro total |
| --- | --- | --- | --- | --- | --- |
| Adia para abril | 10/03/2026 | 10/04/2026 | 1 | 50 | 150 |
| Adia de novo para junho | 10/04/2026 | 10/06/2026 | 2 | 100 | 250 |
| Nova data no mesmo mês | 10/06/2026 | 25/06/2026 | 1 | 50 | 300 |

Validações do adiamento:

- Nova data posterior ao vencimento atual

## 6. Status

- `pendente`: estado inicial. O dinheiro ainda não entrou.
- `adiado`: o vencimento foi empurrado ao menos uma vez. O dinheiro ainda não entrou.
- `recebido`: o valor de face entrou. O usuário marca isso no card.
- `devolvido`: o cheque voltou sem fundo ou por outro problema. É um aviso visual, em vermelho. Não recalcula valor pago, lucro nem valor de face.

Qualquer status pode ir para qualquer outro. Trocar para `pendente`, `recebido` ou `devolvido` não altera valor, lucro, vencimento nem o histórico. `adiado` entra pelo fluxo de adiamento, que recalcula o juro extra.

Cheque `pendente` ou `adiado` com vencimento atual já passado continua em aberto e aparece nos próximos a vencer até ser marcado como recebido ou devolvido.

## 7. Autenticação

- Criar conta
- Entrar
- Sair
- Recuperar senha por e-mail: o usuário informa o e-mail, recebe um link e define uma senha nova
- Cada cheque pertence a uma conta
- Uma conta não lê dados de outra

Campos da conta: nome, e-mail e senha. E-mail único. Idioma e moeda fixos em português e real.

A recuperação de senha envia o link pelo Resend, como descrito na seção 12.

## 8. Persistência, uso e distribuição

A ferramenta de cada item está na seção 12. Os requisitos são:

- Banco de dados para contas, cheques e adiamentos
- Hospedagem da aplicação e do banco no plano gratuito
- Aplicativo móvel empacotado como APK, instalado por arquivo, sem loja
- Interface utilizável no celular: cards, alvos de toque confortáveis, sem tabela como forma principal

O APK é obrigatório. Uma versão web pode existir se a tecnologia escolhida a entregar junto, mas não substitui o APK.

## 9. Dados a guardar

### Conta

- id
- nome
- e-mail
- senha (somente o hash)
- criado_em

### Cheque

- id
- conta_id
- nome_no_cheque
- valor_face
- data_recebimento
- data_vencimento_original
- data_vencimento_atual
- juros_ao_mes
- meses_originais
- meses_adiados
- juros_total_percentual
- valor_pago
- lucro_original
- lucro_adiamentos
- lucro_total
- status (`pendente`, `adiado`, `recebido` ou `devolvido`)
- criado_em

No cadastro, `meses_adiados` e `lucro_adiamentos` começam em zero, `lucro_total` é igual a `lucro_original`, e as duas datas de vencimento são iguais.

### Adiamento

- id
- cheque_id
- vencimento_anterior
- vencimento_novo
- meses
- juros_ao_mes
- lucro
- criado_em

## 10. Ordem sugerida de construção

1. Modelo de dados e regras de cálculo, com os exemplos da seção 5 como testes
2. Cadastro de conta, login, recuperação de senha e isolamento dos cheques por conta
3. Cadastro de cheque, listagem em cards e exclusão
4. Marcar como recebido e como devolvido
5. Adiar, com histórico e atualização do lucro
6. Dashboard e o switch
7. Empacotar o APK e apontar para a API hospedada

## 11. Decisões já fechadas

1. O dia do mês não entra no cálculo.
2. Prazo no mesmo mês civil conta 1 mês. Vale no cadastro e no adiamento.
3. Totais gerais incluem o histórico. O switch restringe valor bruto, lucro e total de empréstimos ao que está em aberto (`pendente` e `adiado`).
4. Próximos a vencer mostra 5 cheques.
5. Não há edição do cadastro. Há exclusão, com confirmação.
6. Conta pede nome, e-mail e senha.
7. Há recuperação de senha por e-mail.
8. Idioma português e moeda real.
9. `devolvido` não altera valores. Esse cheque pode depois ser marcado como `recebido`.
10. O juro do adiamento usa a taxa do cheque e o valor de face. O valor pago permanece o do cadastro.

## 12. Stack

- Next.js com TypeScript, na Vercel. Telas e API no mesmo projeto.
- Turso como banco, na região de São Paulo. Acesso com Drizzle.
- Better Auth para criar conta, entrar, sair e recuperar senha.
- Resend no plano gratuito para o e-mail de recuperação. Sem domínio verificado, o envio chega só no e-mail dono da conta Resend.
- shadcn/ui para os componentes de interface: cards, botões, modal, formulário, switch e avisos de status.
- Lucide (`lucide-react`) para os ícones. É o conjunto que o shadcn já usa.
- Tailwind, já usado pelo shadcn.
- next-themes para claro, escuro e seguir o sistema.
- Capacitor gera o APK. O aplicativo Android abre o site hospedado na Vercel. O APK é instalado por arquivo, sem loja. Atualização de tela sobe no deploy e aparece no celular sem gerar outro APK. O uso precisa de internet.

O plano Hobby da Vercel cobre este uso privado. Se o ICheque passar a ser oferecido a outras pessoas como produto, a hospedagem deixa o plano gratuito.
