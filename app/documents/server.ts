import {env} from 'cloudflare:workers';
import {DocumentStore,FileUnavailableError,type DocActor} from '../../db/document-store';
import {requireAdminRequest} from '../api/admin-auth';
import {findAdvisorByToken} from '../../db/advisors';
import {peekAccessLink} from '../../db/access-links';
import {GUIDE_COOKIE,hasGuideVisit} from '../guide-visit';
export function documentStore(){if(!env.DB)throw new Error('La biblioteca no está disponible.');return new DocumentStore(env.DB)}
export function documentBucket(){if(!env.BUCKET)throw new Error('El almacenamiento de documentos no está disponible.');return env.BUCKET}
export async function documentActor(request:Request):Promise<DocActor|null>{
 const url=new URL(request.url);const guide=url.searchParams.get('guide');const advisor=url.searchParams.get('advisor');
 if(guide){const link=await peekAccessLink(guide);if(!link||link.revoked||Date.parse(link.expiresAt)<=Date.now())return null;const cookie=(request.headers.get('cookie')??'').split(';').map(s=>s.trim()).find(s=>s.startsWith(GUIDE_COOKIE+'='))?.slice(GUIDE_COOKIE.length+1);return hasGuideVisit(cookie,guide,process.env.ADMIN_SESSION_SECRET??'')?'client':null}
 if(advisor)return await findAdvisorByToken(advisor)?'advisor':null;
 return await requireAdminRequest(request)?'admin':null;
}
export class DocumentError extends Error{constructor(message:string,public status=400){super(message)}}
export async function adminMutation(request:Request){if(!await requireAdminRequest(request))throw new DocumentError('Acceso no autorizado.',401);const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new DocumentError('Solicitud no autorizada.',403)}
export async function payload(request:Request){if(Number(request.headers.get('content-length'))>1_000_000)throw new DocumentError('La solicitud es demasiado grande.',413);try{const data=await request.json();if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();return data as Record<string,unknown>}catch{throw new DocumentError('La solicitud no es válida.')}}
export async function guarded(fn:()=>Promise<Response>){try{return await fn()}catch(e){if(e instanceof DocumentError)return Response.json({error:e.message},{status:e.status});if(e instanceof FileUnavailableError)return Response.json({error:e.message},{status:409});console.error('Document library operation failed',e instanceof Error?e.message:'unknown');return Response.json({error:'No fue posible completar la operación. Inténtalo de nuevo.'},{status:500})}}
export function publicVersion(v:Awaited<ReturnType<DocumentStore['version']>>){if(!v)return null;const {storage_key,upload_id,...rest}=v;return rest}
