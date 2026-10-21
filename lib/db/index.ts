import fs from "node:fs"
import path from "node:path"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

function urlDoBanco() {
  return process.env.TURSO_DATABASE_URL ?? "file:data/local.db"
}

function criarBanco() {
  const url = urlDoBanco()
  if (url.startsWith("file:")) {
    const arquivo = url.slice("file:".length)
    const pasta = path.dirname(arquivo)
    if (pasta && pasta !== ".") {
      fs.mkdirSync(pasta, { recursive: true })
    }
  }

  const cliente = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  return drizzle(cliente, { schema })
}

type Banco = ReturnType<typeof criarBanco>

const globalBanco = globalThis as unknown as { ichequeDb?: Banco }

export const db = globalBanco.ichequeDb ?? criarBanco()

if (process.env.NODE_ENV !== "production") {
  globalBanco.ichequeDb = db
}
