import type {DocActor} from './document-store';
export type SearchPage={documentId:string;title:string;versionId:string;version:number;page:number;content:string};
export class DocumentSearch {
 private db:D1Database;
 constructor(db:D1Database){this.db=db}
 async find(actor:DocActor,terms:string[],productIds:string[]):Promise<SearchPage[]>{
  // Only quoted alphanumeric prefixes reach MATCH; user input is never FTS syntax.
  const tokens=[...new Set(terms.flatMap(t=>t.match(/[\p{L}\p{N}]+/gu)??[]))].slice(0,12);
  if(!tokens.length)return[];
  const match=tokens.map(t=>'"'+t+'"*').join(' AND ');
  const clauses=["d.status='current'","d.current_version_id=v.id","v.approved=1","v.text_status='extracted'","f.state='ready'"];
  const values:(string|number)[]=[match];
  if(actor!=='admin')clauses.push(actor==='advisor'?"d.audience IN ('advisors','clients')":"d.audience='clients'");
  if(productIds.length){clauses.push(`EXISTS(SELECT 1 FROM document_product_links l WHERE l.version_id=v.id AND l.product_id IN (${productIds.map(()=>'?').join(',')}) AND p.number BETWEEN l.page_from AND l.page_to)`);values.push(...productIds)}
  return (await this.db.prepare(`SELECT d.id AS documentId,d.title,v.id AS versionId,v.number AS version,p.number AS page,p.content FROM document_page_search JOIN document_pages p ON p.rowid=document_page_search.rowid JOIN document_versions v ON v.id=p.version_id JOIN documents d ON d.id=v.document_id JOIN document_files f ON f.id=v.file_id WHERE document_page_search MATCH ? AND ${clauses.join(' AND ')} ORDER BY bm25(document_page_search),d.id,p.number LIMIT 6`).bind(...values).all<SearchPage>()).results;
 }
 async indexBatch(cursor:number){
  const rows=(await this.db.prepare('SELECT rowid,content FROM document_pages WHERE rowid>? ORDER BY rowid LIMIT 25').bind(cursor).all<{rowid:number;content:string}>()).results;
  for(const row of rows)await this.db.prepare('INSERT OR REPLACE INTO document_page_search(rowid,content) VALUES(?,?)').bind(row.rowid,row.content).run();
  return {indexed:rows.length,cursor:rows.at(-1)?.rowid??cursor,done:rows.length<25};
 }
}
