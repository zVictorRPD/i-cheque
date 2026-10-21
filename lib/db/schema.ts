import { relations, sql } from "drizzle-orm"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const agora = sql`(cast(unixepoch('subsecond') * 1000 as integer))`

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .default(agora),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .default(agora)
    .$onUpdate(() => new Date()),
})

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(agora),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .default(agora)
      .$onUpdate(() => new Date()),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(agora),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .default(agora)
      .$onUpdate(() => new Date()),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(agora),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .default(agora)
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const statusCheque = [
  "pendente",
  "adiado",
  "recebido",
  "devolvido",
] as const

export type StatusCheque = (typeof statusCheque)[number]

export const cheque = sqliteTable(
  "cheque",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    nomeNoCheque: text("nome_no_cheque").notNull(),
    valorFaceCentavos: integer("valor_face_centavos").notNull(),
    dataRecebimento: text("data_recebimento").notNull(),
    dataVencimentoOriginal: text("data_vencimento_original").notNull(),
    dataVencimentoAtual: text("data_vencimento_atual").notNull(),
    jurosAoMesCentesimos: integer("juros_ao_mes_centesimos").notNull(),
    mesesOriginais: integer("meses_originais").notNull(),
    mesesAdiados: integer("meses_adiados").notNull().default(0),
    jurosTotalCentesimos: integer("juros_total_centesimos").notNull(),
    valorPagoCentavos: integer("valor_pago_centavos").notNull(),
    lucroOriginalCentavos: integer("lucro_original_centavos").notNull(),
    lucroAdiamentosCentavos: integer("lucro_adiamentos_centavos")
      .notNull()
      .default(0),
    lucroTotalCentavos: integer("lucro_total_centavos").notNull(),
    status: text("status", { enum: statusCheque }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(agora),
  },
  (table) => [index("cheque_user_id_idx").on(table.userId)]
)

export const adiamento = sqliteTable(
  "adiamento",
  {
    id: text("id").primaryKey(),
    chequeId: text("cheque_id")
      .notNull()
      .references(() => cheque.id, { onDelete: "cascade" }),
    vencimentoAnterior: text("vencimento_anterior").notNull(),
    vencimentoNovo: text("vencimento_novo").notNull(),
    meses: integer("meses").notNull(),
    jurosAoMesCentesimos: integer("juros_ao_mes_centesimos").notNull(),
    lucroCentavos: integer("lucro_centavos").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(agora),
  },
  (table) => [index("adiamento_cheque_id_idx").on(table.chequeId)]
)

export const userRelations = relations(user, ({ many }) => ({
  cheques: many(cheque),
}))

export const chequeRelations = relations(cheque, ({ one, many }) => ({
  user: one(user, { fields: [cheque.userId], references: [user.id] }),
  adiamentos: many(adiamento),
}))

export const adiamentoRelations = relations(adiamento, ({ one }) => ({
  cheque: one(cheque, {
    fields: [adiamento.chequeId],
    references: [cheque.id],
  }),
}))
