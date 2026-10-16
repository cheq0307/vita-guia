import {env} from 'cloudflare:workers';
import {DocumentSearch} from '../../db/document-search';
import {DocumentError,documentActor,guarded} from '../documents/server';
import {planQuestion,buildAnswer} from './policy';
async function input(request:Request){
 const reader=request.body?.getReader();if(!reader)throw new DocumentError('Escribe una pregunta.');
 let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();throw new DocumentError('La consulta es demasiado larga.',413)}chunks.push(value)}
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length}
 try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();return data as Record<string,unknown>}catch{throw new DocumentError('La consulta no es válida.')}
}
export function assistantApi(request:Request,index=false){return guarded(async()=>{
 const actor=await documentActor(request);if(!actor||index&&actor!=='admin')throw new DocumentError('Tu acceso no está disponible. Solicita un enlace nuevo o vuelve a iniciar sesión.',401);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new DocumentError('Solicitud no autorizada.',403);
 if(!env.DB)throw new Error('Document search unavailable');const search=new DocumentSearch(env.DB);const body=await input(request);
 if(index){const cursor=Number(body.cursor??0);if(!Number.isSafeInteger(cursor)||cursor<0)throw new DocumentError('Posición no válida.');return Response.json(await search.indexBatch(cursor),{headers:{'Cache-Control':'no-store'}})}
 if(typeof body.question!=='string'||!body.question.trim()||body.question.length>600)throw new DocumentError('Escribe una pregunta de hasta 600 caracteres.');
 const context=typeof body.productId==='string'?body.productId:undefined;const plan=planQuestion(body.question.trim(),context);
 const pages=plan.search?await search.find(actor,plan.terms,plan.productIds):[];
 const answer=buildAnswer(plan,pages);
 // Provenance stays behind administrator authorization, never in a visitor payload.
 const visitorAnswer={kind:answer.kind,message:answer.message,sources:[],...(answer.productId?{productId:answer.productId}:{})};
 return Response.json(actor==='admin'?answer:visitorAnswer,{headers:{'Cache-Control':'private, no-store'}});
})}
