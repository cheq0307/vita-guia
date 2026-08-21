import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const advisors = sqliteTable("advisors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contact: text("contact").notNull().default(""),
  token: text("token").notNull().unique(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const accessLinks = sqliteTable("access_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  advisorId: integer("advisor_id").references(() => advisors.id),
  recipientName: text("recipient_name").notNull(),
  recipientContact: text("recipient_contact").notNull().default(""),
  expiresAt: text("expires_at").notNull(),
  maxOpens: integer("max_opens"),
  openCount: integer("open_count").notNull().default(0),
  firstOpenedAt: text("first_opened_at"),
  lastOpenedAt: text("last_opened_at"),
  revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  createdBy: text("created_by").notNull().default("local-admin"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
