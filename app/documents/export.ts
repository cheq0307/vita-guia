import type {DocumentStore} from '../../db/document-store';
import {publicVersion} from './server';
// Backpressure keeps a library export from accumulating every page in Worker memory.
export function exportDocuments(store:DocumentStore){
 async function* json(){
  yield '{"format":"vita-documents-v1","exportedAt":'+JSON.stringify(new Date().toISOString())+',"documents":[';
  let firstDocument=true;
  for(let page=1;;page++){
   const list=await store.list('admin','','','',page);
   for(const item of list.documents){
    const document=(await store.document(String(item.id)))!;
    yield (firstDocument?'':',')+JSON.stringify(document).slice(0,-1)+',"versions":[';firstDocument=false;
    let firstVersion=true;
    for(const v of await store.versions(document.id)){
     yield (firstVersion?'':',')+JSON.stringify({...publicVersion(v),pages:await store.pages(v.id),products:await store.links(v.id),download:'/api/documents/files/'+v.id+'?download=1'});firstVersion=false;
    }
    yield ']}';
   }
   if(page>=list.pages)break;
  }
  yield ']}';
 }
 const iterator=json();const encoder=new TextEncoder();
 return new Response(new ReadableStream({async pull(controller){try{const next=await iterator.next();if(next.done)controller.close();else controller.enqueue(encoder.encode(next.value))}catch(error){controller.error(error)}},async cancel(){await iterator.return()}}),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="vita-documentos-indice.json"','Cache-Control':'no-store'}});
}
