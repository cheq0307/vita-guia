import {randomUUID} from 'node:crypto';
export const LIBRARY_QUOTA=500_000_000;
export const PART_SIZE=8*1024*1024;
export type DocActor='admin'|'advisor'|'client';
export type DocumentRecord={id:string;title:string;category:string;audience:string;knowledge_audience:string;status:string;current_version_id:string|null;created_at:string};
export type DocumentFile={id:string;sha256:string;size:number;mime:string;storage_key:string;state:string;upload_id:string|null};
export type DocumentVersion={id:string;document_id:string;file_id:string;number:number;filename:string;page_count:number;text_status:string;approved:number;created_at:string;size:number;mime:string;state:string;sha256:string;storage_key:string;upload_id:string|null};
export class DocumentStore {
 private db:D1Database;
 constructor(db:D1Database){this.db=db}
 async usedBytes(){return (await this.db.prepare("SELECT COALESCE(SUM(size),0) AS total FROM document_files WHERE state!='cancelled'").first<{total:number}>())!.total}
 async reserveFile(hash:string,size:number,mime:string){
  const id=randomUUID();
  await this.db.prepare("INSERT OR IGNORE INTO document_files(id,sha256,size,mime,storage_key) SELECT ?,?,?,?,? WHERE (SELECT COALESCE(SUM(size),0) FROM document_files WHERE state!='cancelled')+?<=?").bind(id,hash,size,mime,'originals/'+id,size,LIBRARY_QUOTA).run();
  const file=await this.db.prepare("SELECT * FROM document_files WHERE sha256=? AND state!='cancelled'").bind(hash).first<DocumentFile>();return file?{...file,fresh:file.id===id}:null;
 }
 async file(id:string){return this.db.prepare('SELECT * FROM document_files WHERE id=?').bind(id).first<DocumentFile>()}
 async setUpload(id:string,uploadId:string){await this.db.prepare('UPDATE document_files SET upload_id=? WHERE id=? AND state=\'uploading\'').bind(uploadId,id).run()}
 async markReady(id:string){await this.db.prepare("UPDATE document_files SET state='ready',upload_id=NULL WHERE id=? AND state='uploading'").bind(id).run()}
 async claimCompletion(id:string){await this.db.prepare("UPDATE document_files SET upload_id='finalizing:'||upload_id WHERE id=? AND state='uploading' AND upload_id IS NOT NULL AND upload_id NOT LIKE 'finalizing:%' AND upload_id NOT LIKE 'cancelling:%'").bind(id).run();return this.file(id)}
 async claimCancellation(id:string){await this.db.prepare("UPDATE document_files SET upload_id='cancelling:'||upload_id WHERE id=? AND state='uploading' AND upload_id IS NOT NULL AND upload_id NOT LIKE 'finalizing:%' AND upload_id NOT LIKE 'cancelling:%'").bind(id).run();return this.file(id)}
 async removeFailedReservation(id:string){await this.db.prepare("DELETE FROM document_files WHERE id=? AND state='uploading' AND NOT EXISTS(SELECT 1 FROM document_versions WHERE file_id=?)").bind(id,id).run()}
 async cancelFile(id:string){const result=await this.db.prepare("UPDATE document_files SET state='cancelled',upload_id=NULL,sha256=sha256||':'||id WHERE id=? AND state='uploading' AND (upload_id IS NULL OR upload_id LIKE 'cancelling:%')").bind(id).run();return result.meta.changes===1}
 async parts(fileId:string){return (await this.db.prepare('SELECT number,etag,size FROM document_parts WHERE file_id=? ORDER BY number').bind(fileId).all<{number:number;etag:string;size:number}>()).results}
 async savePart(fileId:string,number:number,etag:string,size:number){await this.db.prepare('INSERT INTO document_parts(file_id,number,etag,size) VALUES(?,?,?,?) ON CONFLICT(file_id,number) DO UPDATE SET etag=excluded.etag,size=excluded.size').bind(fileId,number,etag,size).run()}
 async createDocument(title:string,category:string,audience:string){const id=randomUUID();await this.db.prepare('INSERT INTO documents(id,title,category,audience) VALUES(?,?,?,?)').bind(id,title,category,audience).run();return (await this.document(id))!}
 async document(id:string){return this.db.prepare('SELECT * FROM documents WHERE id=?').bind(id).first<DocumentRecord>()}
 async createVersion(documentId:string,fileId:string,filename:string){
  const existing=await this.db.prepare('SELECT id FROM document_versions WHERE document_id=? AND file_id=?').bind(documentId,fileId).first<{id:string}>();
  if(existing)return (await this.version(existing.id))!;
  const id=randomUUID();await this.db.prepare('INSERT INTO document_versions(id,document_id,file_id,number,filename) SELECT ?,?,?,COALESCE(MAX(number),0)+1,? FROM document_versions WHERE document_id=?').bind(id,documentId,fileId,filename,documentId).run();return (await this.version(id))!;
 }
 async version(id:string){return this.db.prepare('SELECT v.*,f.size,f.mime,f.state,f.sha256,f.storage_key,f.upload_id FROM document_versions v JOIN document_files f ON f.id=v.file_id WHERE v.id=?').bind(id).first<DocumentVersion>()}
 async versions(documentId:string){return (await this.db.prepare('SELECT v.*,f.size,f.mime,f.state,f.sha256,f.storage_key,f.upload_id FROM document_versions v JOIN document_files f ON f.id=v.file_id WHERE v.document_id=? ORDER BY v.number DESC').bind(documentId).all<DocumentVersion>()).results}
 async versionForFile(fileId:string){const row=await this.db.prepare('SELECT id FROM document_versions WHERE file_id=? ORDER BY created_at LIMIT 1').bind(fileId).first<{id:string}>();return row?this.version(row.id):null}
 async approve(documentId:string,versionId:string){
  const v=await this.version(versionId);if(!v||v.document_id!==documentId||v.state!=='ready')throw new Error('Completa la carga antes de aprobar esta versión.');
  await this.db.prepare('UPDATE document_versions SET approved=1 WHERE id=?').bind(versionId).run();
  await this.db.prepare("UPDATE documents SET current_version_id=?,status='current' WHERE id=?").bind(versionId,documentId).run();
 }
 async updateDocument(id:string,p:{title:string;category:string;audience:string;status:string;knowledge_audience?:string}){await this.db.prepare('UPDATE documents SET title=?,category=?,audience=?,status=?,knowledge_audience=COALESCE(?,knowledge_audience) WHERE id=?').bind(p.title,p.category,p.audience,p.status,p.knowledge_audience??null,id).run()}
 async canRead(versionId:string,actor:DocActor){
  if(actor==='client')return false;
  const v=await this.version(versionId);if(!v||v.state!=='ready')return false;if(actor==='admin')return true;
  const d=await this.document(v.document_id);return !!d&&d.status==='current'&&d.current_version_id===v.id&&v.approved===1&&(d.audience==='clients'||(actor==='advisor'&&d.audience==='advisors'));
 }
 async list(actor:DocActor,q='',category='',status='',page=1,productId=''){
  const clauses=['1=1'];const values:(string|number)[]=[];
  if(actor==='client')clauses.push('0=1');
  if(actor!=='admin'){clauses.push("d.status='current' AND v.approved=1 AND f.state='ready'");clauses.push(actor==='advisor'?"d.audience IN ('advisors','clients')":"d.audience='clients'")}
  if(q){clauses.push('(d.title LIKE ? OR v.filename LIKE ?)');values.push('%'+q+'%','%'+q+'%')}
  if(category){clauses.push('d.category=?');values.push(category)}
  if(status&&actor==='admin'){clauses.push('d.status=?');values.push(status)}
  if(productId){clauses.push('EXISTS(SELECT 1 FROM document_product_links l WHERE l.version_id=d.current_version_id AND l.product_id=?)');values.push(productId)}
  const joins=' FROM documents d LEFT JOIN document_versions v ON v.id=d.current_version_id LEFT JOIN document_files f ON f.id=v.file_id WHERE '+clauses.join(' AND ');
  const total=(await this.db.prepare('SELECT COUNT(*) AS n'+joins).bind(...values).first<{n:number}>())!.n;
  const pages=Math.max(1,Math.ceil(total/20));const safePage=Math.min(pages,Math.max(1,page));
  const rows=(await this.db.prepare('SELECT d.*,v.number AS version_number,v.filename,f.size,(SELECT COUNT(*) FROM document_versions WHERE document_id=d.id) AS version_count'+joins+' ORDER BY d.created_at DESC,d.id LIMIT 20 OFFSET ?').bind(...values,(safePage-1)*20).all()).results;
  return {documents:rows,total,page:safePage,pages};
 }
 async savePages(versionId:string,pages:{number:number;content:string}[]){
  if(!pages.length)return;
  await this.db.batch(pages.map(p=>this.db.prepare('INSERT INTO document_pages(version_id,number,content) VALUES(?,?,?) ON CONFLICT(version_id,number) DO UPDATE SET content=excluded.content').bind(versionId,p.number,p.content)));
 }
 async textBytes(versionId:string){return (await this.db.prepare('SELECT COALESCE(SUM(length(content)),0) AS n FROM document_pages WHERE version_id=?').bind(versionId).first<{n:number}>())!.n}
 async finishText(versionId:string,count:number,state:string){await this.db.prepare('UPDATE document_versions SET page_count=?,text_status=? WHERE id=?').bind(count,state,versionId).run()}
 async pages(versionId:string){return (await this.db.prepare('SELECT number,content FROM document_pages WHERE version_id=? ORDER BY number').bind(versionId).all<{number:number;content:string}>()).results}
 async links(versionId:string){return (await this.db.prepare('SELECT product_id,page_from,page_to FROM document_product_links WHERE version_id=?').bind(versionId).all<{product_id:string;page_from:number;page_to:number}>()).results}
 async replaceLinks(versionId:string,links:{productId:string;pageFrom:number;pageTo:number}[]){await this.db.batch([this.db.prepare('DELETE FROM document_product_links WHERE version_id=?').bind(versionId),...links.map(l=>this.db.prepare('INSERT INTO document_product_links(version_id,product_id,page_from,page_to) VALUES(?,?,?,?)').bind(versionId,l.productId,l.pageFrom,l.pageTo))])}
}
