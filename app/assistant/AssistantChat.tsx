'use client';
import {useEffect,useRef,useState} from 'react';
import type {AssistantAnswer} from './types';
type Exchange={id:string;question:string;answer?:AssistantAnswer;error?:string};
export default function AssistantChat({basePath,productId}:{basePath:string;productId?:string}){
 const [open,setOpen]=useState(false);const [question,setQuestion]=useState('');const [messages,setMessages]=useState<Exchange[]>([]);const [busy,setBusy]=useState(false);
 const active=useRef<AbortController|null>(null);const context=useRef(productId);const body=useRef<HTMLDivElement>(null);const input=useRef<HTMLInputElement>(null);
 const contextIds=useRef<string[]>(productId?[productId]:[]);const previousQuestion=useRef<string|undefined>(undefined);
 const parts=basePath.split('/');const guide=parts[1]==='guia';const advisor=parts[1]==='asesor'?parts[2]:undefined;
 const endpoint=guide?basePath+'/asistente':'/api/assistant'+(advisor?'?advisor='+encodeURIComponent(advisor):'');
 useEffect(()=>()=>active.current?.abort(),[]);
 useEffect(()=>{body.current?.scrollTo({top:body.current.scrollHeight,behavior:'smooth'})},[messages,busy,open]);
 function reset(){if(active.current)return;setMessages([]);setQuestion('');context.current=productId;contextIds.current=productId?[productId]:[];previousQuestion.current=undefined;input.current?.focus()}
 async function ask(value:string,retryId?:string){
  const clean=value.trim();if(!clean||active.current)return;
  const id=retryId??crypto.randomUUID();setBusy(true);setQuestion('');
  setMessages(current=>retryId?current.map(m=>m.id===id?{id,question:clean}:m):[...current,{id,question:clean}]);
  const controller=new AbortController();active.current=controller;
  let timedOut=false;const timeout=setTimeout(()=>{timedOut=true;controller.abort()},20000);
  try{
   const response=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({question:clean,productId:context.current,contextProductIds:contextIds.current,previousQuestion:previousQuestion.current}),signal:controller.signal});
   const answer=await response.json() as AssistantAnswer&{error?:string};if(!response.ok)throw new Error(answer.error??'No se pudo consultar la biblioteca.');
   if(answer.kind!=='missing'){if(answer.productId)context.current=answer.productId;if(answer.contextProductIds?.length)contextIds.current=answer.contextProductIds;previousQuestion.current=clean}
   setMessages(current=>current.map(m=>m.id===id?{...m,answer}:m));
  }catch(error){if(timedOut||!controller.signal.aborted)setMessages(current=>current.map(m=>m.id===id?{...m,error:timedOut?'La consulta tardó demasiado. Vuelve a intentarlo.':error instanceof Error?error.message:'No se pudo consultar. Vuelve a intentarlo.'}:m))}
  finally{clearTimeout(timeout);if(timedOut||!controller.signal.aborted){active.current=null;setBusy(false);input.current?.focus()}}
 }
 return <>
  <button className="chat-trigger" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="vita-assistant" aria-label="Abrir asistente de preguntas"><span>?</span><b>Pregunta sobre tus productos</b></button>
  {open&&<aside className="chat-panel" id="vita-assistant" aria-label="Asistente Vita"><header><div><strong>Asistente Vita</strong><small>Te ayudo con tus productos</small></div><div className="chat-actions"><button className="chat-reset" onClick={reset} disabled={busy||!messages.length} aria-label="Nueva consulta">Nueva consulta</button><button onClick={()=>setOpen(false)} aria-label="Cerrar asistente">×</button></div></header>
   <div className="chat-body" ref={body} aria-live="polite" aria-relevant="additions text"><p className="bot-message">Hola, ¿qué te gustaría saber?</p>
    {messages.map((message,index)=><div key={message.id}><p className="user-message">{message.question}</p>{message.answer&&<div className="bot-message"><p>{message.answer.message}</p>{index===messages.length-1&&message.answer.choices&&<div className="quick-questions" aria-label="Elige una presentación">{message.answer.choices.map(choice=><button key={choice.question} disabled={busy} onClick={()=>void ask(choice.question)}>{choice.label}</button>)}</div>}</div>}{message.error&&<div className="bot-message chat-error" role="alert"><p>{message.error}</p><button className="document-secondary" disabled={busy} onClick={()=>void ask(message.question,message.id)}>Reintentar pregunta</button></div>}</div>)}
    {busy&&<p className="bot-message" role="status">Consultando información…</p>}
    {messages.length===0&&<div className="quick-questions">{(productId?['¿Para qué sirve?','¿Qué ingredientes tiene?','¿Cómo se prepara?']:['¿Para qué sirve Complex Mocha?','¿Qué sabores tiene Active Pro?']).map(suggestion=><button key={suggestion} onClick={()=>void ask(suggestion)}>{suggestion}</button>)}</div>}
   </div>
   <form onSubmit={e=>{e.preventDefault();void ask(question)}}><input ref={input} value={question} onChange={e=>setQuestion(e.target.value)} maxLength={600} disabled={busy} aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta…"/><button disabled={busy||!question.trim()} aria-label="Enviar pregunta">↑</button></form>
  </aside>}
 </>;
}
