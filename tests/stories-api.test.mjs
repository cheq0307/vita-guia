import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
test('written and multimedia stories publish with permission, keep products and enforce file access',{skip:!process.env.VITA_TEST_URL},async()=>{
 const base=new URL(process.env.VITA_TEST_URL);assert.ok(['127.0.0.1','localhost'].includes(base.hostname));
 const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];const headers={cookie,'content-type':'application/json'};
 async function req(path,body,method=body===undefined?'GET':'POST',extra={}){return fetch(new URL('/api/stories'+path,base),{method,headers:{...headers,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})})}
 assert.equal((await fetch(new URL('/api/stories',base))).status,401);
 const marker=randomUUID();const meta={title:'Experiencia '+marker,author:'Prueba local',body:'Integré Active Pro a mi rutina de alimentación.',period:'Dos meses',products:['Active Pro'],permission:false,status:'draft'};
 assert.equal((await req('',meta,'POST',{origin:'https://evil.example'})).status,403);
 assert.equal((await req('',{...meta,products:['No existe']})).status,400);
 const created=await req('',meta);assert.equal(created.status,201);const {story}=await created.json();assert.equal(story.status,'draft');
 assert.equal((await req('/'+story.id,{...meta,status:'published'},'PATCH')).status,409);
 assert.equal((await req('/'+story.id,{...meta,permission:true,status:'published'},'PATCH')).status,200);
 const {link}=await(await fetch(new URL('/api/links',base),{method:'POST',headers,body:JSON.stringify({recipientName:'Prueba historias',validDays:7,maxOpens:1})})).json();
 try{
  const entry=await fetch(new URL('/guia/'+link.token,base),{redirect:'manual'});const guideCookie=entry.headers.get('set-cookie').split(';')[0];
  const html=await(await fetch(new URL('/guia/'+link.token+'/historias?q='+marker,base),{headers:{cookie:guideCookie}})).text();assert.match(html,/Integré Active Pro/);assert.ok(!html.includes('Historia de muestra'));assert.ok(!html.includes('Administrar historias'));
  assert.equal((await req('/'+story.id+'/links',{url:'https://example.com/watch'})).status,409,'Published attachments cannot be edited without a draft');
  await req('/'+story.id,{...meta,body:'',permission:false,status:'draft'},'PATCH');
  assert.equal((await req('/'+story.id+'/links',{url:'javascript:alert(1)'})).status,400);
  const ext=await req('/'+story.id+'/links',{url:'https://example.com/watch',caption:'Experiencia en video'});assert.equal(ext.status,201);
  const bytes=Buffer.alloc(32);Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);Buffer.from(marker.slice(0,20)).copy(bytes,8);const hash=createHash('sha256').update(bytes).digest('hex');
  const startResponse=await req('/'+story.id+'/uploads',{filename:'foto.png',size:bytes.length,sha256:hash,caption:'Foto del producto'});assert.equal(startResponse.status,201,await startResponse.clone().text());const start=await startResponse.json();
  for(let n=0;n<4;n++)assert.equal((await req('/'+story.id+'/links',{url:'https://example.com/watch?v='+n})).status,201);
  const resumed=await req('/'+story.id+'/uploads',{filename:'foto.png',size:bytes.length,sha256:hash});assert.equal(resumed.status,201,'The sixth attachment can resume without creating another slot');assert.equal((await resumed.json()).media.id,start.media.id);
  const mediaUrl='/guia/'+link.token+'/historias/archivo/'+story.id+'/'+start.media.id;
  assert.equal((await fetch(new URL(mediaUrl,base),{headers:{cookie:guideCookie}})).status,404);
  assert.equal((await req('/'+story.id,{...meta,body:'',permission:true,status:'published'},'PATCH')).status,409,'Incomplete multimedia blocks publication');
  const uploaded=await fetch(new URL('/api/stories/uploads/'+start.fileId+'/1',base),{method:'PUT',headers:{cookie,'content-type':'application/octet-stream','x-chunk-sha256':hash},body:bytes});assert.equal(uploaded.status,200,await uploaded.clone().text());assert.equal((await req('/uploads/'+start.fileId+'/complete',{})).status,200);
  assert.equal((await req('/'+story.id,{...meta,body:'',permission:true,status:'published'},'PATCH')).status,200,'Media-only stories are supported');
  const media=await fetch(new URL(mediaUrl,base),{headers:{cookie:guideCookie}});assert.equal(media.status,200);assert.equal(media.headers.get('content-type'),'image/png');assert.equal(createHash('sha256').update(Buffer.from(await media.arrayBuffer())).digest('hex'),hash);
  assert.equal((await fetch(new URL(mediaUrl,base))).status,404);
  const page=await(await fetch(new URL('/guia/'+link.token+'/historias?q='+marker,base),{headers:{cookie:guideCookie}})).text();assert.match(page,/Foto del producto/);assert.match(page,/Ver experiencia en video/);
  await req('/'+story.id,{...meta,body:'',permission:true,status:'archived'},'PATCH');assert.equal((await fetch(new URL(mediaUrl,base),{headers:{cookie:guideCookie}})).status,404);
  const abandoned=Buffer.alloc(32,37);Buffer.from([137,80,78,71,13,10,26,10]).copy(abandoned);const abandonedHash=createHash('sha256').update(abandoned).digest('hex');const info={filename:'pendiente.png',size:abandoned.length,sha256:abandonedHash};
  const pending=await(await req('/'+story.id+'/uploads',info)).json();
  // Make room by removing the already complete test image; archived originals are retained.
  if(!pending.media){await req('/'+story.id+'/media/'+start.media.id,{},'DELETE')}
  const first=pending.media?pending:await(await req('/'+story.id+'/uploads',info)).json();assert.ok(first.media);
  assert.equal((await req('/'+story.id+'/media/'+first.media.id,{},'DELETE')).status,200);
  const second=await(await req('/'+story.id+'/uploads',info)).json();assert.notEqual(second.fileId,first.fileId,'A removed incomplete upload must release its cancelled reservation');assert.equal((await req('/'+story.id+'/media/'+second.media.id,{},'DELETE')).status,200);
 }finally{await req('/'+story.id,{...meta,status:'archived'},'PATCH');await fetch(new URL('/api/links/'+link.id,base),{method:'PATCH',headers})}
});
