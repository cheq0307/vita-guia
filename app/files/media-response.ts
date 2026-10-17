import {documentBucket,DocumentError} from '../documents/server';
import type {DocumentFile} from '../../db/document-store';
export async function mediaResponse(request:Request,file:DocumentFile){
 const range=parseRange(request.headers.get('range'),file.size);const object=await documentBucket().get(file.storage_key,range?{range}:undefined);if(!object||!('body' in object))throw new DocumentError('Archivo no encontrado.',404);
 const headers=new Headers({'Content-Type':file.mime,'Content-Length':String(range?.length??file.size),'Accept-Ranges':'bytes','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline','ETag':object.httpEtag});if(range)headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${file.size}`);
 return new Response(object.body,{status:range?206:200,headers});
}
function parseRange(value:string|null,size:number){if(!value)return undefined;const m=/^bytes=(\d*)-(\d*)$/.exec(value);if(!m||!m[1]&&!m[2])throw new DocumentError('Rango no válido.',416);const offset=m![1]?Number(m![1]):Math.max(0,size-Number(m![2]));const end=m![1]?(m![2]?Math.min(size-1,Number(m![2])):size-1):size-1;if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(end)||offset>=size||offset>end||offset<0)throw new DocumentError('Rango no válido.',416);return{offset,length:end-offset+1}}
