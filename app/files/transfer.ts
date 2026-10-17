import {PART_SIZE} from '../../db/document-store';
import {documentStore,documentBucket,DocumentError} from '../documents/server';
function reject(message:string,status=400):never{throw new DocumentError(message,status)}
async function boundedBytes(request:Request,max:number){const reader=request.body?.getReader();if(!reader)reject('No se recibió el archivo.');const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader!.read();if(done)break;size+=value.length;if(size>max){await reader!.cancel();reject('La parte supera el tamaño permitido.',413)}chunks.push(value)}const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length}return bytes}
export async function transferFile(request:Request,id:string,operation:string){const store=documentStore();const action='uploads';
 if(request.method==='PUT'&&action==='uploads'&&/^\d+$/.test(operation??'')){
  const file=await store.file(id);if(!file||file.state!=='uploading'||!file.upload_id||/^(finalizing|cancelling):/.test(file.upload_id))reject('La carga no está disponible.',409);const number=Number(operation);const count=Math.ceil(file!.size/PART_SIZE);if(number<1||number>count)reject('Parte fuera de rango.');const expected=Math.min(PART_SIZE,file!.size-(number-1)*PART_SIZE);const bytes=await boundedBytes(request,expected);if(bytes.length!==expected)reject('La parte está incompleta.');
  if(number===1&&file!.mime==='application/pdf'&&new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')reject('El archivo no contiene un PDF válido.');
  if(number===1&&file!.mime==='video/mp4'&&new TextDecoder().decode(bytes.slice(4,8))!=='ftyp')reject('El archivo no contiene un MP4 válido.');
  if(number===1&&file!.mime==='video/webm'&&[0x1a,0x45,0xdf,0xa3].some((b,i)=>bytes[i]!==b))reject('El archivo no contiene un WebM válido.');
  if(number===1&&file!.mime==='image/jpeg'&&(bytes[0]!==0xff||bytes[1]!==0xd8||bytes[2]!==0xff))reject('El archivo no contiene un JPG válido.');
  if(number===1&&file!.mime==='image/png'&&[137,80,78,71,13,10,26,10].some((b,i)=>bytes[i]!==b))reject('El archivo no contiene un PNG válido.');
  if(number===1&&file!.mime==='image/webp'&&(new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WEBP'))reject('El archivo no contiene un WebP válido.');
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');if(request.headers.get('x-chunk-sha256')!==digest)reject('La parte llegó alterada. Vuelve a intentarlo.');
  const result=await documentBucket().resumeMultipartUpload(file!.storage_key,file!.upload_id!).uploadPart(number,bytes);await store.savePart(id,number,result.etag,bytes.length);return Response.json({number,received:bytes.length});
 }
 if(request.method==='POST'&&action==='uploads'&&operation==='complete'){
  const file=await store.file(id);if(!file||file.state==='cancelled')reject('Carga no encontrada.',404);if(file!.state==='ready')return Response.json({ready:true});if(!file!.upload_id)reject('La carga no se ha iniciado.',409);
  const parts=await store.parts(id);if(parts.length!==Math.ceil(file!.size/PART_SIZE)||parts.some((p,i)=>p.number!==i+1||p.size!==Math.min(PART_SIZE,file!.size-i*PART_SIZE)))reject('Faltan partes por cargar.',409);
  const claimed=await store.claimCompletion(id);if(!claimed||claimed.state==='cancelled')reject('La carga fue cancelada.',409);if(claimed.upload_id?.startsWith('cancelling:'))reject('La carga se está cancelando.',409);if(claimed.state==='ready')return Response.json({ready:true});const bucket=documentBucket();const existing=await bucket.head(file!.storage_key);if(!existing)await bucket.resumeMultipartUpload(file!.storage_key,claimed.upload_id!.replace(/^finalizing:/,'')).complete(parts.map(p=>({partNumber:p.number,etag:p.etag})));const head=await bucket.head(file!.storage_key);if(head?.size!==file!.size)reject('El tamaño final no coincide. Contacta al administrador.',409);await store.markReady(id);return Response.json({ready:true});
 }
 if(request.method==='POST'&&action==='uploads'&&operation==='cancel'){const file=await store.file(id);if(!file||file.state!=='uploading')reject('Solo se pueden cancelar cargas incompletas.',409);const claimed=await store.claimCancellation(id);if(claimed?.upload_id?.startsWith('finalizing:'))reject('El archivo ya se está finalizando. Continúa la carga para terminarlo.',409);if(claimed?.upload_id)await documentBucket().resumeMultipartUpload(file.storage_key,claimed.upload_id.replace(/^cancelling:/,'')).abort();await store.cancelFile(id);return Response.json({cancelled:true})}
return Response.json({error:'Ruta no encontrada.'},{status:404});
}
