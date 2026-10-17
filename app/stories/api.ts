import {storyStore} from './server';
import {storyMediaMime,type StoryInput} from './policy';
import {products} from '../portal-content';
import {externalVideoUrl} from '../videos/policy';
import {mediaResponse} from '../files/media-response';
import {DocumentError,documentActor,adminMutation,payload,guarded,documentStore,documentBucket} from '../documents/server';
import {documentsApi} from '../documents/api';
import {PART_SIZE} from '../../db/document-store';
function reject(message:string,status=400):never{throw new DocumentError(message,status)}
function text(v:unknown,max:number){return typeof v==='string'&&v.trim().length<=max?v.trim():''}
function metadata(p:Record<string,unknown>):StoryInput{
 const title=text(p.title,180);const author=text(p.author,100);if(!title||!author)reject('Escribe el título y el nombre o las iniciales de quien comparte la experiencia.');
 if(typeof p.body!=='string'||p.body.length>10000||typeof p.period!=='string'||p.period.length>100)reject('Revisa el relato y el tiempo de uso.');
 const names=Array.isArray(p.products)?p.products:[];const known=new Set(products.map(p=>p.family));if(names.length>13||names.some(n=>typeof n!=='string'||!known.has(n)))reject('Revisa los productos relacionados.');
 const status=p.status??'draft';if(!['draft','published','archived'].includes(String(status)))reject('Revisa el estado de la historia.');
 if(status==='published'&&/\[Cuenta|\[describe/i.test(p.body))reject('Sustituye el ejemplo por la experiencia real antes de publicar.');
 return{title,author,body:p.body.trim(),period:p.period.trim(),products:[...new Set(names)] as string[],permission:p.permission===true,status:status as StoryInput['status']};
}
export async function storiesApi(request:Request,path:string[]=[]){return guarded(async()=>{
 const store=storyStore();const files=documentStore();const [action,id,operation]=path;const url=new URL(request.url);
 if(request.method==='GET'&&!path.length){const actor=await documentActor(request);if(!actor)reject('Acceso no autorizado.',401);return Response.json(await store.list(actor==='admin',text(url.searchParams.get('q')??'',120),Number(url.searchParams.get('pagina'))||1),{headers:{'Cache-Control':'private, no-store'}})}
 if(request.method==='GET'&&action==='files'&&path.length===3){const actor=await documentActor(request);const story=await store.get(id);if(!actor||!story||actor!=='admin'&&(story.status!=='published'||!story.permission))reject('Contenido no disponible.',404);const media=await store.medium(id,operation);if(!media?.file_id)reject('Archivo no disponible.',404);const file=await files.file(media!.file_id!);if(!file||file.state!=='ready')reject('Archivo no disponible.',404);return mediaResponse(request,file!)}
 if(request.method==='GET'&&path.length===1){if(await documentActor(request)!=='admin')reject('Acceso no autorizado.',401);const story=await store.get(action);if(!story)reject('Historia no encontrada.',404);return Response.json({story})}
 await adminMutation(request);
 if(request.method==='POST'&&!path.length){const p=metadata(await payload(request));const story=await store.create({...p,status:'draft'});return Response.json({story},{status:201})}
 if(request.method==='PATCH'&&path.length===1){if(!await store.get(action))reject('Historia no encontrada.',404);const p=metadata(await payload(request));if(!await store.update(action,p))reject('Para publicar, agrega un relato o multimedia completa y confirma la autorización para compartir.',409);return Response.json({story:await store.get(action)})}
 if(request.method==='POST'&&id==='links'&&path.length===2){const p=await payload(request);const link=externalVideoUrl(p.url);if(!link)reject('Usa un enlace HTTPS válido.');const media=await store.attach(action,{kind:'link',url:link,fileId:null,caption:text(p.caption,300)});if(!media)reject('Guarda como borrador para editar los adjuntos. Máximo 6 por historia.',409);return Response.json({media},{status:201})}
 if(request.method==='POST'&&id==='uploads'&&path.length===2){
  const story=await store.get(action);if(!story||story.status==='published')reject('Guarda como borrador antes de adjuntar archivos. Máximo 6 por historia.',409);
  const p=await payload(request);const mime=storyMediaMime(text(p.filename,180));const size=Number(p.size);const hash=text(p.sha256,64);const max=mime?.startsWith('image/')?10*1024*1024:200*1024*1024;
  if(!mime||!Number.isSafeInteger(size)||size<12||size>max||!/^[a-f0-9]{64}$/.test(hash))reject('Usa JPG, PNG o WebP hasta 10 MB, o MP4/WebM hasta 200 MB.');
  if(story!.media.filter(m=>m.removed===0).length>=6&&!await store.mediumForHash(action,hash))reject('Máximo 6 adjuntos por historia.',409);
  const file=await files.reserveFile(hash,size,mime!);if(!file)reject('Se alcanzó el espacio compartido de 500 MB.',409);if(file.size!==size||file.mime!==mime)reject('El archivo no coincide con la carga registrada.');
  if(file.upload_id?.startsWith('cancelling:'))reject('Se está cancelando la carga anterior. Vuelve a intentarlo en un momento.',409);
  if(file.fresh){try{const upload=await documentBucket().createMultipartUpload(file.storage_key,{httpMetadata:{contentType:mime!}});await files.setUpload(file.id,upload.uploadId)}catch(e){await files.removeFailedReservation(file.id);throw e}}
  const media=await store.attach(action,{kind:mime!.startsWith('image/')?'image':'video',url:null,fileId:file.id,caption:text(p.caption,300)});if(!media)reject('No se pudo adjuntar. Vuelve a abrir la historia.',409);
  return Response.json({media,fileId:file.id,partSize:PART_SIZE,parts:await files.parts(file.id),ready:file.state==='ready'},{status:201});
 }
 if(action==='uploads'&&id&&path.length===3&&(request.method==='PUT'&&/^\d+$/.test(operation)||request.method==='POST'&&['complete','cancel'].includes(operation))){const file=await files.file(id);if(!file||!['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.mime))reject('Carga no disponible.',404);return documentsApi(request,['uploads',id,operation])}
 if(request.method==='DELETE'&&id==='media'&&path.length===3){const media=await store.medium(action,operation,true);if(!await store.removeMedia(action,operation))reject('Guarda como borrador o conserva al menos un relato o adjunto.',409);if(media?.file_id){const file=await files.file(media.file_id);if(file?.state==='uploading'&&file.upload_id?.startsWith('cancelling:')){const cancelled=await documentsApi(new Request(request.url,{method:'POST',headers:request.headers}),['uploads',file.id,'cancel']);if(!cancelled.ok)return cancelled}}return Response.json({removed:true})}
 return Response.json({error:'Ruta no encontrada.'},{status:404});
})}
