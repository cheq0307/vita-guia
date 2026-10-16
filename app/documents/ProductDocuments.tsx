'use client';
import {useEffect,useState} from 'react';
import type {DocumentRow,LibraryResult} from './types';
export default function ProductDocuments({productId,basePath}:{productId:string;basePath:string}){
 const [documents,setDocuments]=useState<DocumentRow[]>([]);const [error,setError]=useState(false);const [reload,setReload]=useState(0);const params=new URLSearchParams({product:productId,public:'1'});const parts=basePath.split('/');if(parts[1]==='guia')params.set('guide',parts[2]);if(parts[1]==='asesor')params.set('advisor',parts[2]);const query=params.toString();
 const apiBase=parts[1]==='guia'?basePath+'/documentos':'/api/documents';
 useEffect(()=>{let current=true;setError(false);fetch(apiBase+'?'+query,{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error();const result=await r.json() as LibraryResult;if(current)setDocuments(result.documents)}).catch(()=>current&&setError(true));return()=>{current=false}},[apiBase,query,reload]);
 if(!documents.length&&!error)return null;
 return <section className="product-documents" aria-labelledby="product-documents-title"><h2 id="product-documents-title">Documentos del producto</h2>{error?<p>No fue posible cargar los documentos. <button className="document-secondary" onClick={()=>setReload(n=>n+1)}>Reintentar</button></p>:<ul>{documents.map(doc=><li key={doc.id}><a href={apiBase+'/files/'+doc.current_version_id+'?'+query} target="_blank" rel="noreferrer">{doc.title} ↗</a><span>Versión {doc.version_number}</span></li>)}</ul>}</section>;
}
