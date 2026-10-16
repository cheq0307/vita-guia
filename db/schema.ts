import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, index, check } from 'drizzle-orm/sqlite-core';
import { uniqueIndex } from 'drizzle-orm/sqlite-core';

export const documents=sqliteTable('documents',{
  knowledgeAudience:text('knowledge_audience',{enum:['internal','advisors','clients']}).notNull().default('internal'),
  id:text('id').primaryKey(),title:text('title').notNull(),category:text('category').notNull(),audience:text('audience').notNull().default('internal'),status:text('status').notNull().default('pending'),currentVersionId:text('current_version_id'),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
},t=>[index('documents_visibility').on(t.status,t.audience),check('documents_category',sql`${t.category} IN ('technical','catalog','training','business','other')`),check('documents_audience',sql`${t.audience} IN ('internal','advisors','clients')`),check('documents_status',sql`${t.status} IN ('pending','current','archived')`)]);
export const documentFiles=sqliteTable('document_files',{
  id:text('id').primaryKey(),sha256:text('sha256').notNull().unique(),size:integer('size').notNull(),mime:text('mime').notNull(),storageKey:text('storage_key').notNull().unique(),state:text('state').notNull().default('uploading'),uploadId:text('upload_id'),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
},t=>[check('document_file_size',sql`${t.size}>0 AND ${t.size}<=209715200`),check('document_file_state',sql`${t.state} IN ('uploading','ready','cancelled')`)]);
export const documentVersions=sqliteTable('document_versions',{
  id:text('id').primaryKey(),documentId:text('document_id').notNull().references(()=>documents.id),fileId:text('file_id').notNull().references(()=>documentFiles.id),number:integer('number').notNull(),filename:text('filename').notNull(),pageCount:integer('page_count').notNull().default(0),textStatus:text('text_status').notNull().default('pending'),approved:integer('approved').notNull().default(0),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
},t=>[uniqueIndex('document_version_number').on(t.documentId,t.number),uniqueIndex('document_version_file').on(t.documentId,t.fileId),index('document_versions_file').on(t.fileId)]);
export const documentParts=sqliteTable('document_parts',{
  fileId:text('file_id').notNull().references(()=>documentFiles.id),number:integer('number').notNull(),etag:text('etag').notNull(),size:integer('size').notNull(),
},t=>[uniqueIndex('document_part_number').on(t.fileId,t.number)]);
export const documentPages=sqliteTable('document_pages',{
  versionId:text('version_id').notNull().references(()=>documentVersions.id),number:integer('number').notNull(),content:text('content').notNull(),
},t=>[uniqueIndex('document_page_number').on(t.versionId,t.number)]);
export const documentProductLinks=sqliteTable('document_product_links',{
  versionId:text('version_id').notNull().references(()=>documentVersions.id),productId:text('product_id').notNull(),pageFrom:integer('page_from').notNull(),pageTo:integer('page_to').notNull(),
},t=>[uniqueIndex('document_product_version').on(t.versionId,t.productId),index('document_product_lookup').on(t.productId)]);
export const advisors = sqliteTable('advisors', {
  id:integer('id').primaryKey({autoIncrement:true}), name:text('name').notNull(), contact:text('contact').notNull().default(''), token:text('token').notNull().unique(), active:integer('active').notNull().default(1), createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [check('advisor_active', sql`${table.active} IN (0, 1)`)]);
export const accessLinks = sqliteTable('access_links', {
  id:integer('id').primaryKey({autoIncrement:true}), token:text('token').notNull().unique(), advisorId:integer('advisor_id').references(() => advisors.id, {onDelete:'set null'}), recipientName:text('recipient_name').notNull(), recipientContact:text('recipient_contact').notNull().default(''), expiresAt:text('expires_at').notNull(), maxOpens:integer('max_opens'), openCount:integer('open_count').notNull().default(0), firstOpenedAt:text('first_opened_at'), lastOpenedAt:text('last_opened_at'), revoked:integer('revoked').notNull().default(0), createdBy:text('created_by').notNull().default('admin'), createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [index('idx_access_links_expires_at').on(table.expiresAt), index('idx_access_links_advisor_id').on(table.advisorId), check('link_open_count', sql`${table.openCount} >= 0`), check('link_max_opens', sql`${table.maxOpens} IS NULL OR ${table.maxOpens} > 0`), check('link_revoked', sql`${table.revoked} IN (0, 1)`)]);
