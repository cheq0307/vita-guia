import {randomUUID} from 'node:crypto';
import type {VideoItem,VideoPage,VideoFilter,VideoStatus,VideoKind} from '../app/videos/policy';
const select='SELECT v.*,f.state AS file_state,f.size,f.mime FROM videos v LEFT JOIN document_files f ON f.id=v.file_id';
export class VideoStore {
 private db:D1Database;
 constructor(db:D1Database){this.db=db}
 async create(input:{title:string;description:string;kind:VideoKind;url:string|null;fileId:string|null}){
  const id=randomUUID();await this.db.prepare('INSERT INTO videos(id,title,description,search_text,kind,url,file_id) VALUES(?,?,?,?,?,?,?) ON CONFLICT(file_id) DO NOTHING').bind(id,input.title,input.description,normalize(input.title+' '+input.description),input.kind,input.url,input.fileId).run();return input.fileId?(await this.forFile(input.fileId))!:(await this.get(id))!;
 }
 async get(id:string){return this.db.prepare(select+' WHERE v.id=?').bind(id).first<VideoItem>()}
 async forFile(id:string){return this.db.prepare(select+' WHERE v.file_id=? ORDER BY v.created_at LIMIT 1').bind(id).first<VideoItem>()}
 async list(admin:boolean,q='',filter:VideoFilter='all',page=1):Promise<VideoPage>{
  const where:string[]=['1=1'];const values:(string|number)[]=[];
  if(!admin)where.push("v.status='published' AND (v.kind='link' OR f.state='ready')");
  if(filter!=='all'){where.push('v.kind=?');values.push(filter)}
  // Normalize accents in JavaScript at write/search time, not per-row SQL functions.
  if(q){where.push('v.search_text LIKE ?');values.push('%'+normalize(q)+'%')}
  const clause=' WHERE '+where.join(' AND ');
  const total=(await this.db.prepare('SELECT COUNT(*) AS n FROM videos v LEFT JOIN document_files f ON f.id=v.file_id'+clause).bind(...values).first<{n:number}>())!.n;
  const pages=Math.max(1,Math.ceil(total/9));const safePage=Math.min(pages,Math.max(1,Number.isFinite(page)?Math.floor(page):1));
  const items=(await this.db.prepare(select+clause+' ORDER BY v.created_at DESC,v.id LIMIT 9 OFFSET ?').bind(...values,(safePage-1)*9).all<VideoItem>()).results;
  return {items,total,pages,page:safePage};
 }
 async update(id:string,p:{title:string;description:string;url:string|null;status:VideoStatus}){
  const result=await this.db.prepare("UPDATE videos SET title=?,description=?,search_text=?,url=?,status=? WHERE id=? AND (?!='published' OR kind='link' OR EXISTS(SELECT 1 FROM document_files f WHERE f.id=videos.file_id AND f.state='ready'))").bind(p.title,p.description,normalize(p.title+' '+p.description),p.url,p.status,id,p.status).run();return result.meta.changes===1;
 }
}
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
