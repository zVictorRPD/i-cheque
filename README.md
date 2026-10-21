# iCheque

Gestão de empréstimos por desconto de cheque. As regras de negócio estão em `PLANO.md`.

## Rodar localmente

```bash
npm install
npm run db:push
npm run dev
```

Abra http://localhost:3000. Copie `.env.example` para `.env` antes do `npm run db:push`. Sem `TURSO_DATABASE_URL`, os dados ficam em `data/local.db`.

Sem `RESEND_API_KEY`, o link de recuperação de senha aparece no terminal do servidor.

## Variáveis

Veja `.env.example`. Na Vercel, defina `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`. O banco Turso deve ficar em São Paulo.

## Testes

```bash
npm test
```
