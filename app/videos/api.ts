import {videoStore} from './server';
import {externalVideoUrl,videoFilter,videoMime,type VideoItem,type VideoStatus} from './policy';
import {DocumentError,documentActor,adminMutation,payload,guarded,documentStore,documentBucket} from '../documents/server';
import {documentsApi} from '../documents/api';
import {PART_SIZE,LIBRARY_QUOTA} from '../../db/document-store';
function reject(message:string,status=400):never{throw new DocumentError(message,status)}
function text(value:unknown,max:number){return typeof value==='string'&&value.trim().length<=max?value.trim():''}
function metadata(p:Record<string,unknown>){const title=text(p.title,180);const description=text(p.description,1500);if(!title||!description)reject('Escribe un título y de qué trata el video.');return{title,description}}
function publicItem(v:VideoItem,admin:boolean){const {file_id,file_state,size,mime,...item}=v;return admin?v:item}
export async function videosApi(request:Request,path:string[]=[]){return guarded(async()=>{
 const store=videoStore();const files=documentStore();const url=new URL(request.url);const [action,id,operation]=path;
 if(request.method==='GET'&&!path.length){const actor=await documentActor(request);if(!actor)reject('Acceso no autorizado.',401);const result=await store.list(actor==='admin',text(url.searchParams.get('q')??'',120),videoFilter(url.searchParams.get('tipo')),Number(url.searchParams.get('pagina'))||1);return Response.json({...result,items:result.items.map(v=>publicItem(v,actor==='admin')),...(actor==='admin'?{usedBytes:await files.usedBytes(),quota:LIBRARY_QUOTA}:{})},{headers:{'Cache-Control':'private, no-store'}})}
 if(request.method==='GET'&&action==='files'&&path.length===2){
  const actor=await documentActor(request);const video=await store.get(id);if(!actor||!video||video.kind!=='file'||actor!=='admin'&&video.status!=='published')reject('Video no disponible.',404);
  const file=await files.file(video!.file_id!);if(!file||file.state!=='ready')reject('Video no disponible.',404);
  const range=parseRange(request.headers.get('range'),file!.size);const object=await documentBucket().get(file!.storage_key,range?{range}:undefined);if(!object||!('body' in object))reject('Archivo no encontrado.',404);
  const headers=new Headers({'Content-Type':file!.mime,'Content-Length':String(range?.length??file!.size),'Accept-Ranges':'bytes','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline','ETag':object!.httpEtag});if(range)headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${file!.size}`);
  return new Response(object!.body,{status:range?206:200,headers});
 }
 await adminMutation(request);
 if(request.method==='POST'&&!path.length){const p=await payload(request);const meta=metadata(p);const link=externalVideoUrl(p.url);if(!link)reject('Usa un enlace HTTPS válido a una página externa.');const video=await store.create({...meta,kind:'link',url:link,fileId:null});return Response.json({video},{status:201})}
 if(request.method==='POST'&&action==='uploads'&&path.length===1){
  const p=await payload(request);const meta=metadata(p);const filename=text(p.filename,180);const mime=videoMime(filename);const size=Number(p.size);const hash=text(p.sha256,64);
  if(!mime||!Number.isSafeInteger(size)||size<12||size>200*1024*1024||!/^[a-f0-9]{64}$/.test(hash))reject('Selecciona un MP4 o WebM de hasta 200 MB.');
  const file=await files.reserveFile(hash,size,mime!);if(!file)reject('No hay espacio disponible dentro de los 500 MB compartidos con documentos.',409);if(file.size!==size||file.mime!==mime)reject('El archivo no coincide con la carga registrada.');
  if(file.fresh){try{const upload=await documentBucket().createMultipartUpload(file.storage_key,{httpMetadata:{contentType:mime!}});await files.setUpload(file.id,upload.uploadId)}catch(e){await files.removeFailedReservation(file.id);throw e}}
  const video=await store.forFile(file.id)??await store.create({...meta,kind:'file',url:null,fileId:file.id});
  return Response.json({video,fileId:file.id,partSize:PART_SIZE,parts:await files.parts(file.id),ready:file.state==='ready'},{status:201});
 }
 if(action==='uploads'&&id&&path.length===3&&(request.method==='PUT'&&/^\d+$/.test(operation)||request.method==='POST'&&['complete','cancel'].includes(operation))){
  const video=await store.forFile(id);const file=await files.file(id);if(!video||!file||!['video/mp4','video/webm'].includes(file.mime))reject('Carga no encontrada.',404);
  // Reuse the existing checked, resumable multipart transfer and quota reservation.
  return documentsApi(request,['uploads',id,operation]);
 }
 if(request.method==='PATCH'&&path.length===1){const video=await store.get(action);if(!video)reject('Video no encontrado.',404);const p=await payload(request);const meta=metadata(p);const status=p.status as VideoStatus;if(!['draft','published','archived'].includes(status))reject('Revisa el estado del contenido.');const link=video!.kind==='link'?externalVideoUrl(p.url):null;if(video!.kind==='link'&&!link)reject('Usa un enlace HTTPS válido.');if(!await store.update(action,{...meta,url:link,status}))reject('Termina de subir el archivo antes de publicarlo.',409);return Response.json({video:await store.get(action)})}
 return Response.json({error:'Ruta no encontrada.'},{status:404});
})}
function parseRange(value:string|null,size:number){if(!value)return undefined;const match=/^bytes=(\d*)-(\d*)$/.exec(value);if(!match||!match[1]&&!match[2])reject('Rango no válido.',416);const offset=match![1]?Number(match![1]):Math.max(0,size-Number(match![2]));const end=match![1]?(match![2]?Math.min(size-1,Number(match![2])):size-1):size-1;if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(end)||offset>=size||offset>end||offset<0)reject('Rango no válido.',416);return{offset,length:end-offset+1}}
