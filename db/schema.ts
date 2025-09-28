import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const languages = sqliteTable("languages", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  native_name: text().notNull(),
  key: text().notNull(),
  flag: text().notNull()
});

export const currencies = sqliteTable("currencies", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  symbol: text().notNull()
});

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull(),
  password: text().notNull(),
  language_id: integer()
    .references(() => languages.id)
    .default(1),
  currency_id: integer()
    .references(() => currencies.id)
    .default(1),
  dark_mode: integer().default(0)
});

export const categories = sqliteTable("categories", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull(),
  icon: text().notNull()
});

export const transactions = sqliteTable("transactions", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: integer()
    .notNull()
    .references(() => users.id),
  category_id: integer().references(() => categories.id),
  amount: real().notNull(),
  type: text().notNull(), // 'income' or 'expense'
  date: text().notNull(),
  time: text(),
  note: text()
});

export const budgets = sqliteTable("budgets", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: integer()
    .notNull()
    .references(() => users.id),
  category_id: integer().references(() => categories.id),
  amount: real().notNull(),
  month: integer().notNull() //YYYYMM (202401 for Jan 2024)
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.category_id],
    references: [categories.id]
  }),
  user: one(users, {
    fields: [transactions.user_id],
    references: [users.id]
  })
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.category_id],
    references: [categories.id]
  }),
  user: one(users, {
    fields: [budgets.user_id],
    references: [users.id]
  })
}));

export type User = typeof users.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type Currency = typeof currencies.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Bu = typeof budgets.$inferSelect;
type Tr = typeof transactions.$inferSelect;
export interface Transaction extends Tr {
  category?: Category;
  user?: User;
}

export interface Budget extends Bu {
  user?: User;
  category?: Category;
}
