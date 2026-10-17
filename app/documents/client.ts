export async function documentRequest<T=Record<string,unknown>>(path:string,body?:unknown,method=body===undefined?'GET':'POST'):Promise<T>{
 const response=await fetch('/api/documents'+path,{method,cache:'no-store',...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
 const data=await response.json() as T&{error?:string};if(!response.ok)throw new Error(data.error??'No fue posible completar la operación.');return data;
}
export async function fileHash(file:File,onProgress:(n:number)=>void){const {createSHA256}=await import('hash-wasm');const hash=await createSHA256();hash.init();for(let at=0;at<file.size;at+=8*1024*1024){hash.update(new Uint8Array(await file.slice(at,at+8*1024*1024).arrayBuffer()));onProgress(Math.min(1,(at+8*1024*1024)/file.size))}return hash.digest('hex')}
export async function extractDocumentText(file:File,versionId:string,onProgress:(message:string)=>void,send:typeof documentRequest=documentRequest){
 let pageCount=0;let task:ReturnType<typeof import('pdfjs-dist')['getDocument']>|undefined;
 try{
  let pages:{number:number;content:string}[]=[];let anyText=false;let total=0;
  if(file.name.toLowerCase().endsWith('.pdf')){
   const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/vendor/pdf.worker.min.mjs';task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),useSystemFonts:true,disableFontFace:true});const pdf=await task.promise;
   if(pdf.numPages>2000)throw new Error('El documento supera 2000 páginas; se conservará el original sin extracción.');pageCount=pdf.numPages;
   for(let n=1;n<=pageCount;n++){onProgress(`Extrayendo texto: página ${n} de ${pageCount}`);const page=await pdf.getPage(n);const text=await page.getTextContent();const content=text.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join('').trim();total+=content.length;if(content.length>20000||total>5_000_000)throw new Error('El texto supera el límite de extracción.');anyText||=content.length>0;pages.push({number:n,content});page.cleanup();if(pages.length===25){await send(`/versions/${versionId}/text`,{pages,pageCount});pages=[]}}
  }else if(file.name.toLowerCase().endsWith('.txt')){const content=await file.text();if(content.length>20000)throw new Error('El texto supera el límite de extracción.');pageCount=1;pages=[{number:1,content}];anyText=!!content.trim()}
  if(pages.length)await send(`/versions/${versionId}/text`,{pages,pageCount});await send(`/versions/${versionId}/text`,{pages:[],pageCount,finish:true,state:anyText?'extracted':'unavailable'});return anyText?'Texto conservado por página.':'Original guardado. No se detectó texto extraíble; puedes revisarlo visualmente.';
 }catch(error){await send(`/versions/${versionId}/text`,{pages:[],pageCount,finish:true,state:'unavailable'});return 'Original guardado. No se pudo extraer todo el texto: '+(error instanceof Error?error.message:'revisa el PDF.');}
 finally{await task?.destroy()}
}
