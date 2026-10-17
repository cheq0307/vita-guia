import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
test('video links and multipart files publish, stream ranges and preserve client permissions',{skip:!process.env.VITA_TEST_URL},async()=>{
 const base=new URL(process.env.VITA_TEST_URL);assert.ok(['127.0.0.1','localhost'].includes(base.hostname));
 const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];const headers={cookie,'content-type':'application/json'};
 async function req(path,body,method=body===undefined?'GET':'POST',extra={}){return fetch(new URL('/api/videos'+path,base),{method,headers:{...headers,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})})}
 assert.equal((await fetch(new URL('/api/videos',base))).status,401);
 assert.equal((await req('',{title:'X',description:'Y',url:'javascript:alert(1)'})).status,400);
 assert.equal((await req('',{title:'X',description:'Y',url:'https://example.com'},'POST',{origin:'https://evil.example'})).status,403);
 const marker=randomUUID();const meta={title:'Enlace '+marker,description:'Preparación en video',url:'https://example.com/watch?v='+marker};
 const created=await req('',meta);assert.equal(created.status,201,await created.clone().text());const {video:link}=await created.json();
 const {link:access}=await(await fetch(new URL('/api/links',base),{method:'POST',headers,body:JSON.stringify({recipientName:'Prueba videos',validDays:7,maxOpens:1})})).json();
 const entry=await fetch(new URL('/guia/'+access.token,base),{redirect:'manual'});const guideCookie=entry.headers.get('set-cookie').split(';')[0];
 const clientList=()=>fetch(new URL('/api/videos?guide='+access.token+'&q='+marker,base),{headers:{cookie:guideCookie}}).then(r=>r.json());
 assert.equal((await clientList()).total,0);
 assert.equal((await req('/'+link.id,{...meta,status:'published'},'PATCH')).status,200);
 const publicList=await clientList();assert.equal(publicList.items[0].id,link.id);assert.equal('file_id' in publicList.items[0],false);
 const linkPage=await(await fetch(new URL('/guia/'+access.token+'/videos?tipo=link&q='+marker,base),{headers:{cookie:guideCookie}})).text();assert.ok(linkPage.includes(meta.title));assert.match(linkPage,/noopener noreferrer/);assert.match(linkPage,/Enlace externo/);
 const bytes=Buffer.alloc(8*1024*1024+32,0);bytes.writeUInt32BE(24,0);bytes.write('ftypisom',4);bytes.write(marker,40);const hash=createHash('sha256').update(bytes).digest('hex');
 const started=await req('/uploads',{title:'Archivo '+marker,description:'Video de prueba',filename:'prueba.mp4',size:bytes.length,sha256:hash});assert.equal(started.status,201,await started.clone().text());const upload=await started.json();
 const fileMeta={title:upload.video.title,description:upload.video.description,url:null,status:'published'};
 assert.equal((await req('/'+upload.video.id,fileMeta,'PATCH')).status,409);
 assert.equal((await fetch(new URL('/api/videos/files/'+upload.video.id,base),{headers})).status,404);
 assert.equal((await req('/uploads/'+upload.fileId+'/complete',{})).status,409);
 for(let n=1,at=0;at<bytes.length;n++,at+=upload.partSize){const part=bytes.subarray(at,at+upload.partSize);const response=await fetch(new URL(`/api/videos/uploads/${upload.fileId}/${n}`,base),{method:'PUT',headers:{cookie,'content-type':'application/octet-stream','x-chunk-sha256':createHash('sha256').update(part).digest('hex')},body:part});assert.equal(response.status,200,await response.clone().text());if(n===1){const resumed=await(await req('/uploads',{title:upload.video.title,description:upload.video.description,filename:'prueba.mp4',size:bytes.length,sha256:hash})).json();assert.equal(resumed.video.id,upload.video.id);assert.equal(resumed.parts.length,1)}}
 assert.equal((await req('/uploads/'+upload.fileId+'/complete',{})).status,200);
 assert.equal((await req('/'+upload.video.id,fileMeta,'PATCH')).status,200);
 const filePath='/guia/'+access.token+'/videos/archivo/'+upload.video.id;
 assert.equal((await fetch(new URL(filePath,base))).status,404);
 const streamed=await fetch(new URL(filePath,base),{headers:{cookie:guideCookie,range:'bytes=4-7'}});assert.equal(streamed.status,206);assert.equal(streamed.headers.get('content-type'),'video/mp4');assert.equal(await streamed.text(),'ftyp');
 assert.equal((await fetch(new URL(filePath,base),{headers:{cookie:guideCookie,range:'bytes=999999999-'}})).status,416);
 const suffix=await fetch(new URL(filePath,base),{headers:{cookie:guideCookie,range:'bytes=-4'}});assert.equal(suffix.status,206);assert.equal((await suffix.arrayBuffer()).byteLength,4);
 assert.equal((await req('/'+upload.video.id,{...fileMeta,status:'archived'},'PATCH')).status,200);
 assert.equal((await fetch(new URL(filePath,base),{headers:{cookie:guideCookie}})).status,404);
 await req('/'+link.id,{...meta,status:'archived'},'PATCH');assert.equal((await clientList()).total,0);
 await fetch(new URL('/api/links/'+access.id,base),{method:'PATCH',headers});assert.equal((await fetch(new URL(filePath,base),{headers:{cookie:guideCookie}})).status,404);
});
