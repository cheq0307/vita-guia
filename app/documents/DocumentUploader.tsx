'use client';
import {useRef,useState} from 'react';
import {categories,audiences,bytesLabel} from './policy';
import {documentRequest,extractDocumentText,fileHash} from './client';
import type {UploadStart} from './types';
export default function DocumentUploader({document,onComplete,onClose}:{document?:{id:string;title:string;category:string;audience:string};onComplete:(id:string)=>void;onClose:()=>void}){
 const [file,setFile]=useState<File|null>(null);const [title,setTitle]=useState(document?.title??'');const [category,setCategory]=useState(document?.category??'technical');const [audience,setAudience]=useState(document?.audience??'internal');const [busy,setBusy]=useState(false);const [progress,setProgress]=useState(0);const [message,setMessage]=useState('');const [error,setError]=useState('');const [paused,setPaused]=useState(false);const pause=useRef(false);
 async function upload(event:React.FormEvent){event.preventDefault();if(!file)return;setBusy(true);setError('');pause.current=false;setPaused(false);try{
  setMessage('Comprobando archivo…');const sha256=await fileHash(file,n=>setProgress(n*10));
  const start=await documentRequest<UploadStart>('/uploads',{documentId:document?.id,title,category,audience,filename:file.name,size:file.size,sha256});
  localStorage.setItem('vita-pending-upload',JSON.stringify({documentId:start.document.id,filename:file.name}));
  const completed=new Set<number>((start.parts as {number:number}[]).map(p=>p.number));
  if(start.version.state!=='ready')for(let at=0,n=1;at<file.size;at+=start.partSize,n++){
   if(pause.current){setPaused(true);setMessage('Carga pausada. Vuelve a seleccionar este archivo si cierras la página.');return}
   if(!completed.has(n)){setMessage(`Subiendo ${file.name}`);const bytes=await file.slice(at,at+start.partSize).arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');const response=await fetch(`/api/documents/uploads/${start.fileId}/${n}`,{method:'PUT',headers:{'content-type':'application/octet-stream','x-chunk-sha256':digest},body:bytes});if(!response.ok)throw new Error((await response.json() as {error:string}).error)}setProgress(10+Math.min(1,(at+start.partSize)/file.size)*80);
  }
  await documentRequest(`/uploads/${start.fileId}/complete`,{});setProgress(90);
  let extraction='El archivo ya estaba registrado.';if(!start.version.approved)extraction=await extractDocumentText(file,start.version.id,setMessage);
  localStorage.removeItem('vita-pending-upload');setProgress(100);setMessage(extraction);onComplete(start.document.id);
 }catch(e){setError((e instanceof Error?e.message:'No se pudo cargar el archivo.')+' Puedes volver a intentarlo: se conservarán las partes recibidas.');setPaused(true)}finally{setBusy(false)}}
 return <section className="document-upload" aria-labelledby="upload-title"><header><div><h2 id="upload-title">{document?'Agregar nueva versión':'Subir documento'}</h2><p>Se conserva el original. Una nueva versión requiere revisión antes de reemplazar a la vigente.</p></div><button type="button" className="document-secondary" onClick={onClose} disabled={busy}>Cerrar</button></header><form onSubmit={upload}>
  <label className="document-file-picker">Seleccionar archivo<input type="file" required accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx,.pptx,.xlsx" disabled={busy} onChange={e=>{const next=e.target.files?.[0]??null;setFile(next);if(next&&!title)setTitle(next.name.replace(/\.[^.]+$/,''))}}/><span>{file?`${file.name} · ${bytesLabel(file.size)}`:'PDF, imágenes, texto u Office. Hasta 200 MB por archivo.'}</span></label>
  <div className="document-form-grid"><label>Título<input required maxLength={180} value={title} disabled={busy||!!document} onChange={e=>setTitle(e.target.value)}/></label><label>Categoría<select value={category} disabled={busy||!!document} onChange={e=>setCategory(e.target.value)}>{Object.entries(categories).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Quién podrá consultarlo<select value={audience} disabled={busy||!!document} onChange={e=>setAudience(e.target.value)}>{Object.entries(audiences).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
  {(busy||message)&&<div className="document-progress"><progress value={progress} max={100} aria-label="Progreso de carga"/><p role="status">{message}</p></div>}{error&&<p role="alert" className="form-error">{error}</p>}
  <div className="document-actions"><button className="primary-button" disabled={busy||!file}>{busy?'Guardando…':paused?'Continuar carga':'Guardar archivo'}</button>{busy&&progress<90&&<button type="button" className="document-secondary" onClick={()=>{pause.current=true;setMessage('Pausando al terminar la parte actual…')}}>Pausar carga</button>}</div>
 </form></section>;
}
