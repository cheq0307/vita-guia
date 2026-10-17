import {randomUUID} from 'node:crypto';
import type {StoryInput,StoryItem,StoryPage,StoryMedia} from '../app/stories/policy';
type Row=Omit<StoryItem,'products'|'permission'|'media'>&{products:string;permission:number};
const mediaSelect='SELECT m.*,f.state,f.size,f.mime FROM story_media m LEFT JOIN document_files f ON f.id=m.file_id';
const validMedia="(m.kind='link' OR EXISTS(SELECT 1 FROM document_files f WHERE f.id=m.file_id AND f.state='ready'))";
const publishable=`permission=1 AND (length(trim(body))>0 OR EXISTS(SELECT 1 FROM story_media m WHERE m.story_id=stories.id AND m.removed=0)) AND NOT EXISTS(SELECT 1 FROM story_media m WHERE m.story_id=stories.id AND m.removed=0 AND NOT ${validMedia})`;
export class StoryStore{
 private db:D1Database;constructor(db:D1Database){this.db=db}
 async create(p:StoryInput){const id=randomUUID();await this.db.prepare('INSERT INTO stories(id,title,author,body,period,products,permission,search_text) VALUES(?,?,?,?,?,?,?,?)').bind(id,p.title,p.author,p.body,p.period,JSON.stringify(p.products),p.permission?1:0,searchText(p)).run();return (await this.get(id))!}
 async get(id:string):Promise<StoryItem|null>{const row=await this.db.prepare('SELECT * FROM stories WHERE id=?').bind(id).first<Row>();return row?{...row,products:JSON.parse(row.products),permission:row.permission===1,media:await this.media(id,true)}:null}
 async media(id:string,includeCleanup=false){return (await this.db.prepare(mediaSelect+' WHERE m.story_id=? AND '+(includeCleanup?"(m.removed=0 OR (f.state='uploading' AND f.upload_id LIKE 'cancelling:%'))":'m.removed=0')+' ORDER BY m.created_at,m.id').bind(id).all<StoryMedia>()).results}
 async medium(storyId:string,id:string,includeRemoved=false){return this.db.prepare(mediaSelect+' WHERE m.story_id=? AND m.id=?'+(includeRemoved?'':' AND m.removed=0')).bind(storyId,id).first<StoryMedia>()}
 async mediumForHash(storyId:string,hash:string){return this.db.prepare(mediaSelect+' WHERE m.story_id=? AND f.sha256=? AND m.removed=0').bind(storyId,hash).first<StoryMedia>()}
 async list(admin:boolean,q='',page=1):Promise<StoryPage>{
  const where=admin?'1=1':"status='published' AND "+publishable;const clause=' WHERE '+where+(q?' AND search_text LIKE ?':'');const args=q?['%'+normalize(q)+'%']:[];
  const total=(await this.db.prepare('SELECT COUNT(*) AS n FROM stories'+clause).bind(...args).first<{n:number}>())!.n;const pages=Math.max(1,Math.ceil(total/9));const safe=Math.min(pages,Math.max(1,Number.isFinite(page)?Math.floor(page):1));
  const rows=(await this.db.prepare('SELECT * FROM stories'+clause+' ORDER BY created_at DESC,id LIMIT 9 OFFSET ?').bind(...args,(safe-1)*9).all<Row>()).results;
  const media=rows.length?(await this.db.prepare(mediaSelect+' WHERE m.removed=0 AND m.story_id IN ('+rows.map(()=>'?').join(',')+') ORDER BY m.created_at,m.id').bind(...rows.map(r=>r.id)).all<StoryMedia>()).results:[];
  return{total,pages,page:safe,items:rows.map(r=>({...r,products:JSON.parse(r.products),permission:r.permission===1,media:media.filter(m=>m.story_id===r.id)}))};
 }
 async update(id:string,p:StoryInput){
  // One statement: the publication decision evaluates the new text and permission.
  const ready=`(?=1 AND (length(trim(?))>0 OR EXISTS(SELECT 1 FROM story_media m WHERE m.story_id=stories.id AND m.removed=0)) AND NOT EXISTS(SELECT 1 FROM story_media m WHERE m.story_id=stories.id AND m.removed=0 AND NOT ${validMedia}))`;
  const result=await this.db.prepare(`UPDATE stories SET title=?,author=?,body=?,period=?,products=?,permission=?,status=?,search_text=? WHERE id=? AND (?!='published' OR ${ready})`).bind(p.title,p.author,p.body,p.period,JSON.stringify(p.products),p.permission?1:0,p.status,searchText(p),id,p.status,p.permission?1:0,p.body).run();return result.meta.changes===1;
 }
 async attach(storyId:string,p:{kind:StoryMedia['kind'];url:string|null;fileId:string|null;caption:string}){
  const usable="(? IS NULL OR EXISTS(SELECT 1 FROM document_files WHERE id=? AND state!='cancelled' AND COALESCE(upload_id,'') NOT LIKE 'cancelling:%'))";
  const existing=p.fileId?await this.db.prepare('SELECT id FROM story_media WHERE story_id=? AND file_id=?').bind(storyId,p.fileId).first<{id:string}>():null;
  if(existing){await this.db.prepare("UPDATE story_media SET removed=0 WHERE id=? AND EXISTS(SELECT 1 FROM stories WHERE id=? AND status!='published') AND (removed=0 OR (SELECT COUNT(*) FROM story_media WHERE story_id=? AND removed=0)<6) AND "+usable).bind(existing.id,storyId,storyId,p.fileId,p.fileId).run();return this.medium(storyId,existing.id)}
  const id=randomUUID();await this.db.prepare("INSERT INTO story_media(id,story_id,kind,url,file_id,caption) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM stories WHERE id=? AND status!='published') AND (SELECT COUNT(*) FROM story_media WHERE story_id=? AND removed=0)<6 AND "+usable+" ON CONFLICT(story_id,file_id) DO NOTHING").bind(id,storyId,p.kind,p.url,p.fileId,p.caption,storyId,storyId,p.fileId,p.fileId).run();
  if(p.fileId){const row=await this.db.prepare('SELECT id FROM story_media WHERE story_id=? AND file_id=? AND removed=0').bind(storyId,p.fileId).first<{id:string}>();return row?this.medium(storyId,row.id):null}return this.medium(storyId,id);
 }
 async removeMedia(storyId:string,id:string){
  // Detach and claim an unused multipart upload in the same D1 transaction.
  // New attaches reject the cancelling marker until abort is confirmed.
  const result=await this.db.batch([
   this.db.prepare("UPDATE story_media SET removed=1 WHERE id=? AND story_id=? AND EXISTS(SELECT 1 FROM stories s WHERE s.id=? AND (s.status!='published' OR length(trim(s.body))>0 OR (SELECT COUNT(*) FROM story_media WHERE story_id=s.id AND removed=0)>1))").bind(id,storyId,storyId),
   this.db.prepare("UPDATE document_files SET upload_id='cancelling:'||upload_id WHERE id=(SELECT file_id FROM story_media WHERE id=? AND story_id=? AND removed=1) AND state='uploading' AND upload_id IS NOT NULL AND upload_id NOT LIKE 'finalizing:%' AND upload_id NOT LIKE 'cancelling:%' AND NOT EXISTS(SELECT 1 FROM story_media m WHERE m.file_id=document_files.id AND m.removed=0) AND NOT EXISTS(SELECT 1 FROM document_versions v WHERE v.file_id=document_files.id) AND NOT EXISTS(SELECT 1 FROM videos v WHERE v.file_id=document_files.id) AND NOT EXISTS(SELECT 1 FROM contribution_files x WHERE x.file_id=document_files.id AND x.removed=0)").bind(id,storyId)
  ]);return result[0].meta.changes===1;
 }
}
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function searchText(p:StoryInput){return normalize([p.title,p.author,p.body,...p.products].join(' '))}
