import {readFile,open,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {resolve,basename} from 'node:path';
import assert from 'node:assert/strict';
// Run from the checkout with --env-file=.env.local. Private Sites bearer stays on hidden stdin.
if(!process.stdin.isTTY)throw new Error('Use an interactive terminal to keep the private bearer hidden.');
process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');
process.stderr.write('Ready for document import JSON on stdin (input is hidden).\n');
let input='';const config=await new Promise((res,rej)=>process.stdin.on('data',chunk=>{input+=chunk;if(/[\r\n]/.test(input)){process.stdin.setRawMode(false);process.stdin.pause();try{res(JSON.parse(input))}catch(e){rej(e)}}}));
const base=new URL(config.url);assert.ok(base.protocol==='https:'&&base.hostname.endsWith('.chatgpt.site')||base.protocol==='http:'&&['localhost','127.0.0.1'].includes(base.hostname));
const auth=config.token?{'OAI-Sites-Authorization':'Bearer '+config.token}:{};
const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD}),redirect:'manual'});assert.equal(login.status,200,'Administrator login');
const headers={...auth,cookie:login.headers.get('set-cookie').split(';')[0]};
async function api(path,body,method=body===undefined?'GET':'POST'){
 const response=await fetch(new URL('/api/documents'+path,base),{method,headers:{...headers,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(!response.ok)throw new Error('Document operation '+path+' failed ('+response.status+'): '+await response.text());return response.json();
}
const sourceDir=resolve(config.sourceDir??'work/source-documents/2026-10-15');
const ids=['active-pro-chocolate','active-pro-fresa','active-pro-tropical','stormix','complex-mocha-frasco','complex-mocha-stick','complex-green-leaves-frasco','complex-green-leaves-stick','re-new-pro','hc-fit','ahcc-plus','support-plus','nad-shield-plus','connect-plus','hemp-c','espresso','macchiato'];
const definitions=[
 {index:1,title:'Catálogo HC Wellness 2026',category:'catalog',filename:'HCW_PPT_2026_ACTUALIZADA.pdf',ranges:[4,4,4,5,6,6,7,7,8,9,11,12,13,14,15,17,18].map(n=>[n,n])},
 {index:2,title:'Ficha técnica HC Wellness',category:'technical',filename:'FICHA TÉCNICA ESPAÑOL FNL (1).pdf',ranges:[[1,4],[5,8],[41,44],[38,40],[12,14],[32,34],[15,17],[35,37],[20,22],[29,31],[9,11],[23,25],[18,19],[26,28]]},
];
const imported=[];
for(const def of definitions){
 const path=resolve(sourceDir,'original-'+def.index+'.pdf');const extracted=JSON.parse(await readFile(resolve(sourceDir,'document-'+def.index+'.json'),'utf8'));
 const hash=createHash('sha256');let size=0;for await(const chunk of createReadStream(path)){hash.update(chunk);size+=chunk.length}assert.equal(hash.digest('hex'),extracted.sha256);assert.equal(size,extracted.bytes);
 const start=await api('/uploads',{title:def.title,category:def.category,audience:'internal',filename:def.filename,size,sha256:extracted.sha256});
 const completed=new Set(start.parts.map(p=>p.number));const file=await open(path);
 try{if(start.version.state!=='ready')for(let at=0,n=1;at<size;at+=start.partSize,n++){
  if(!completed.has(n)){const bytes=Buffer.alloc(Math.min(start.partSize,size-at));const read=await file.read(bytes,0,bytes.length,at);assert.equal(read.bytesRead,bytes.length);let okay=false;
   for(let attempt=0;attempt<3&&!okay;attempt++){const response=await fetch(new URL('/api/documents/uploads/'+start.fileId+'/'+n,base),{method:'PUT',headers:{...headers,'content-type':'application/octet-stream','x-chunk-sha256':createHash('sha256').update(bytes).digest('hex')},body:bytes});okay=response.ok;if(!okay&&attempt===2)throw new Error('Part '+n+' failed ('+response.status+')')}
  }
  console.log(JSON.stringify({document:def.title,part:n,total:Math.ceil(size/start.partSize)}));
 }}finally{await file.close()}
 await api('/uploads/'+start.fileId+'/complete',{});
 if(!start.version.approved){
  for(let at=0;at<extracted.pages.length;at+=25)await api('/versions/'+start.version.id+'/text',{pageCount:extracted.page_count,pages:extracted.pages.slice(at,at+25).map(p=>({number:p.page,content:p.text}))});
  await api('/versions/'+start.version.id+'/text',{pageCount:extracted.page_count,pages:[],finish:true,state:'extracted'});
 }
 await api('/versions/'+start.version.id+'/links',{links:def.ranges.map(([pageFrom,pageTo],i)=>({productId:ids[i],pageFrom,pageTo}))},'PUT');
 await api('/'+start.document.id+'/approve',{versionId:start.version.id});
 const downloaded=await fetch(new URL('/api/documents/files/'+start.version.id,base),{headers});assert.equal(downloaded.status,200);
 const downloadedHash=createHash('sha256');let received=0;for await(const chunk of downloaded.body){downloadedHash.update(chunk);received+=chunk.length}assert.equal(received,size);assert.equal(downloadedHash.digest('hex'),extracted.sha256);
 const savedText=await api('/versions/'+start.version.id+'/text');assert.equal(savedText.pages.length,extracted.page_count);if(!start.version.approved)for(let i=0;i<savedText.pages.length;i++)assert.equal(savedText.pages[i].content,extracted.pages[i].text);
 imported.push({documentId:start.document.id,versionId:start.version.id,title:def.title,size,sha256:extracted.sha256,pages:extracted.page_count,products:def.ranges.length});
 console.log(JSON.stringify({verified:def.title,bytes:size,pages:extracted.page_count,products:def.ranges.length}));
}
const manifest=await api('/export');await mkdir('outputs',{recursive:true});await writeFile('outputs/document-library-export.json',JSON.stringify(manifest,null,2));
await writeFile('outputs/document-library-import.json',JSON.stringify({url:base.origin,imported},null,2));
console.log('Original downloads and stored page text verified. Export retained locally.');
