import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, index, check } from 'drizzle-orm/sqlite-core';
export const advisors = sqliteTable('advisors', {
  id:integer('id').primaryKey({autoIncrement:true}), name:text('name').notNull(), contact:text('contact').notNull().default(''), token:text('token').notNull().unique(), active:integer('active').notNull().default(1), createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [check('advisor_active', sql`${table.active} IN (0, 1)`)]);
export const accessLinks = sqliteTable('access_links', {
  id:integer('id').primaryKey({autoIncrement:true}), token:text('token').notNull().unique(), advisorId:integer('advisor_id').references(() => advisors.id, {onDelete:'set null'}), recipientName:text('recipient_name').notNull(), recipientContact:text('recipient_contact').notNull().default(''), expiresAt:text('expires_at').notNull(), maxOpens:integer('max_opens'), openCount:integer('open_count').notNull().default(0), firstOpenedAt:text('first_opened_at'), lastOpenedAt:text('last_opened_at'), revoked:integer('revoked').notNull().default(0), createdBy:text('created_by').notNull().default('admin'), createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [index('idx_access_links_expires_at').on(table.expiresAt), index('idx_access_links_advisor_id').on(table.advisorId), check('link_open_count', sql`${table.openCount} >= 0`), check('link_max_opens', sql`${table.maxOpens} IS NULL OR ${table.maxOpens} > 0`), check('link_revoked', sql`${table.revoked} IN (0, 1)`)]);
