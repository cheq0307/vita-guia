import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
test('document uploads resume, deduplicate, preserve approved versions and enforce file permissions',{skip:!process.env.VITA_TEST_URL},async()=>{
 const base=new URL(process.env.VITA_TEST_URL);assert.ok(['127.0.0.1','localhost'].includes(base.hostname));
 const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});
 const cookie=login.headers.get('set-cookie').split(';')[0];const headers={cookie,'content-type':'application/json'};
 async function json(path,body,method='POST'){return fetch(new URL('/api/documents'+path,base),{method,headers,body:JSON.stringify(body)})}
 assert.equal((await fetch(new URL('/api/documents',base))).status,401);
 const bytes=Buffer.alloc(8*1024*1024+700,32);bytes.write('%PDF-1.7\n'+randomUUID());const sha=createHash('sha256').update(bytes).digest('hex');
 const meta={title:'Prueba biblioteca '+randomUUID(),category:'technical',audience:'clients',filename:'Catálogo de prueba.pdf',size:bytes.length,sha256:sha};
 const started=await json('/uploads',meta);assert.equal(started.status,201,await started.clone().text());const data=await started.json();
 const {fileId,document,version}=data;
 async function part(n,b){return fetch(new URL(`/api/documents/uploads/${fileId}/${n}`,base),{method:'PUT',headers:{cookie,'content-type':'application/octet-stream','x-chunk-sha256':createHash('sha256').update(b).digest('hex')},body:b})}
 assert.equal((await part(1,bytes.subarray(0,8*1024*1024))).status,200);
 assert.equal((await json(`/uploads/${fileId}/complete`,{})).status,409);
 const resume=await(await fetch(new URL('/api/documents/uploads/'+fileId,base),{headers})).json();assert.equal(resume.parts.length,1);
 assert.equal((await part(2,bytes.subarray(8*1024*1024))).status,200);
 assert.equal((await json(`/uploads/${fileId}/complete`,{})).status,200);
 assert.equal((await json(`/${document.id}/approve`,{versionId:version.id})).status,409);
 assert.equal((await json(`/versions/${version.id}/text`,{pageCount:2,pages:[{number:1,content:'Texto original página uno'},{number:2,content:'Texto original página dos'}]})).status,200);
 assert.equal((await json(`/versions/${version.id}/text`,{pageCount:2,pages:[],finish:true,state:'extracted'})).status,200);
 assert.equal((await json(`/versions/${version.id}/links`,{links:[{productId:'hc-fit',pageFrom:1,pageTo:3}]},'PUT')).status,400);
 assert.equal((await json(`/versions/${version.id}/links`,{links:[{productId:'hc-fit',pageFrom:1,pageTo:2}]},'PUT')).status,200);
 const {advisor}=await(await fetch(new URL('/api/advisors',base),{method:'POST',headers,body:JSON.stringify({name:'Prueba documentos',contact:'documentos@example.test'})})).json();
 const publicFile=new URL('/api/documents/files/'+version.id+'?advisor='+advisor.token,base);
 assert.equal((await fetch(publicFile)).status,404);
 assert.equal((await json(`/${document.id}/approve`,{versionId:version.id})).status,200);
 const downloaded=await fetch(publicFile);assert.equal(downloaded.status,200);assert.equal(createHash('sha256').update(Buffer.from(await downloaded.arrayBuffer())).digest('hex'),sha);
 const ranged=await fetch(publicFile,{headers:{range:'bytes=0-8'}});assert.equal(ranged.status,206);assert.equal(await ranged.text(),'%PDF-1.7\n');
 const repeated=await(await json('/uploads',meta)).json();assert.equal(repeated.fileId,fileId);assert.equal(repeated.version.id,version.id);
 assert.equal((await json(`/versions/${version.id}/text`,{pageCount:2,pages:[]})).status,409);
 const internal={title:meta.title,category:'technical',audience:'internal',status:'current'};
 assert.equal((await json('/'+document.id,internal,'PATCH')).status,200);assert.equal((await fetch(publicFile)).status,404);
 assert.equal((await fetch(new URL('/api/documents/files/'+version.id,base),{headers})).status,200);
 const forbidden=await fetch(new URL('/api/documents/'+document.id,base),{method:'PATCH',headers:{...headers,origin:'https://evil.example'},body:JSON.stringify(internal)});assert.equal(forbidden.status,403);
 const backup=await fetch(new URL('/api/documents/export',base),{headers});assert.equal(backup.status,200);assert.equal((await backup.json()).format,'vita-documents-v1');
 await fetch(new URL('/api/advisors/'+advisor.id,base),{method:'PATCH',headers});assert.equal((await fetch(publicFile)).status,404);
});
