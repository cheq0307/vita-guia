'use client';
import {useEffect,useRef,useState} from 'react';
import type {AssistantAnswer,AnswerSource} from './types';
type Exchange={id:string;question:string;answer?:AssistantAnswer;error?:string};
export default function AssistantChat({basePath,productId}:{basePath:string;productId?:string}){
 const [open,setOpen]=useState(false);const [question,setQuestion]=useState('');const [messages,setMessages]=useState<Exchange[]>([]);const [busy,setBusy]=useState(false);
 const active=useRef<AbortController|null>(null);const context=useRef(productId);const body=useRef<HTMLDivElement>(null);const input=useRef<HTMLInputElement>(null);
 const parts=basePath.split('/');const guide=parts[1]==='guia';const advisor=parts[1]==='asesor'?parts[2]:undefined;
 const endpoint=guide?basePath+'/asistente':'/api/assistant'+(advisor?'?advisor='+encodeURIComponent(advisor):'');
 useEffect(()=>()=>active.current?.abort(),[]);
 useEffect(()=>{body.current?.scrollTo({top:body.current.scrollHeight,behavior:'smooth'})},[messages,busy,open]);
 function fileHref(source:AnswerSource){return (guide?basePath+'/documentos/files/':'/api/documents/files/')+encodeURIComponent(source.versionId)+(advisor?'?advisor='+encodeURIComponent(advisor):'')+'#page='+source.page}
 async function ask(value:string,retryId?:string){
  const clean=value.trim();if(!clean||active.current)return;
  const id=retryId??crypto.randomUUID();setBusy(true);setQuestion('');
  setMessages(current=>retryId?current.map(m=>m.id===id?{id,question:clean}:m):[...current,{id,question:clean}]);
  const controller=new AbortController();active.current=controller;
  try{
   const response=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({question:clean,productId:context.current}),signal:controller.signal});
   const answer=await response.json() as AssistantAnswer&{error?:string};if(!response.ok)throw new Error(answer.error??'No se pudo consultar la biblioteca.');
   if(answer.productId)context.current=answer.productId;
   setMessages(current=>current.map(m=>m.id===id?{...m,answer}:m));
  }catch(error){if(!controller.signal.aborted)setMessages(current=>current.map(m=>m.id===id?{...m,error:error instanceof Error?error.message:'No se pudo consultar. Vuelve a intentarlo.'}:m))}
  finally{if(!controller.signal.aborted){active.current=null;setBusy(false);input.current?.focus()}}
 }
 function sources(answer:AssistantAnswer){return <div className="chat-sources">{answer.sources.map(source=><div key={source.versionId+'-'+source.page}><blockquote>{source.excerpt}</blockquote><a href={fileHref(source)} target="_blank" rel="noreferrer">{source.title} · v{source.version} · página {source.page} ↗</a></div>)}</div>}
 return <>
  <button className="chat-trigger" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="vita-assistant" aria-label="Abrir asistente de preguntas"><span>?</span><b>Pregunta sobre tus productos</b></button>
  {open&&<aside className="chat-panel" id="vita-assistant" aria-label="Asistente Vita"><header><div><strong>Asistente Vita</strong><small>Fichas y documentos disponibles para ti</small></div><button onClick={()=>setOpen(false)} aria-label="Cerrar asistente">×</button></header>
   <div className="chat-body" ref={body} aria-live="polite" aria-relevant="additions text"><p className="bot-message">Hola, consulta un producto o un tema. Cuando encuentre información en un documento, te mostraré la fuente y su página.</p>
    {messages.map(message=><div key={message.id}><p className="user-message">{message.question}</p>{message.answer&&<div className="bot-message"><p>{message.answer.message}</p>{message.answer.sources.length>0&&(message.answer.kind==='documents'?sources(message.answer):<details><summary>Ver fuentes ({message.answer.sources.length})</summary>{sources(message.answer)}</details>)}</div>}{message.error&&<div className="bot-message chat-error" role="alert"><p>{message.error}</p><button className="document-secondary" disabled={busy} onClick={()=>void ask(message.question,message.id)}>Reintentar pregunta</button></div>}</div>)}
    {busy&&<p className="bot-message" role="status">Consultando información…</p>}
    {messages.length===0&&<div className="quick-questions"><button onClick={()=>void ask('¿Qué sabores tiene Active Pro?')}>¿Qué sabores tiene Active Pro?</button><button onClick={()=>void ask('¿Qué falta confirmar de HC-Fit?')}>¿Qué falta confirmar de HC-Fit?</button></div>}
   </div>
   <form onSubmit={e=>{e.preventDefault();void ask(question)}}><input ref={input} value={question} onChange={e=>setQuestion(e.target.value)} maxLength={600} disabled={busy} aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta…"/><button disabled={busy||!question.trim()} aria-label="Enviar pregunta">↑</button></form>
  </aside>}
 </>;
}
