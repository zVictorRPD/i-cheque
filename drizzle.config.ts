import { defineConfig } from "drizzle-kit"

const url = process.env.TURSO_DATABASE_URL ?? "file:data/local.db"
const schema = "./lib/db/schema.ts"
const out = "./drizzle"

export default defineConfig(
  url.startsWith("file:")
    ? {
        schema,
        out,
        dialect: "sqlite",
        dbCredentials: { url },
      }
    : {
        schema,
        out,
        dialect: "turso",
        dbCredentials: {
          url,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }
)
