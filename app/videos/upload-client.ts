type Start={fileId:string;partSize:number;parts:{number:number}[]};
export async function uploadVideoParts(file:File,start:Start,onProgress:(n:number)=>void,isPaused:()=>boolean,sendPart:(fileId:string,number:number,bytes:ArrayBuffer)=>Promise<void>=sendVideoPart){
 const completed=new Set(start.parts.map(p=>p.number));
 for(let at=0,n=1;at<file.size;at+=start.partSize,n++){
  if(isPaused())return 'paused';
  if(!completed.has(n))await sendPart(start.fileId,n,await file.slice(at,at+start.partSize).arrayBuffer());
  onProgress(10+Math.min(1,(at+start.partSize)/file.size)*85);
 }
 // A pause requested during the final PUT must win before finalization/publication.
 return isPaused()?'paused':'complete';
}
async function sendVideoPart(fileId:string,number:number,bytes:ArrayBuffer){
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const response=await fetch(`/api/videos/uploads/${fileId}/${number}`,{method:'PUT',headers:{'content-type':'application/octet-stream','x-chunk-sha256':digest},body:bytes});
 if(!response.ok)throw new Error((await response.json() as {error:string}).error);
}
