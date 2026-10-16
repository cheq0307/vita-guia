import assert from 'node:assert/strict';
if(!process.stdin.isTTY)throw new Error('Use an interactive terminal for hidden credentials.');
process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');process.stderr.write('Ready for hidden configuration JSON.\n');
let input='';const config=await new Promise((resolve,reject)=>process.stdin.on('data',chunk=>{input+=chunk;if(/[\r\n]/.test(input)){process.stdin.setRawMode(false);process.stdin.pause();try{resolve(JSON.parse(input))}catch(e){reject(e)}}}));
const base=new URL(config.url);assert.ok(base.protocol==='https:'&&base.hostname.endsWith('.chatgpt.site')||base.protocol==='http:'&&['localhost','127.0.0.1'].includes(base.hostname));
const auth=config.token?{'OAI-Sites-Authorization':'Bearer '+config.token}:{};
const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});assert.equal(login.status,200);
const headers={...auth,cookie:login.headers.get('set-cookie').split(';')[0],'content-type':'application/json'};
async function request(path,method='GET',body,custom=headers){const response=await fetch(new URL(path,base),{method,headers:custom,...(body?{body:JSON.stringify(body)}:{})});assert.ok(response.ok,method+' '+path+' '+response.status);return response.json()}
assert.equal(config.documents.length,2,'Only the two reviewed originals');
for(const expected of config.documents){
 const {document,versions}=await request('/api/documents/'+expected.id);const current=versions.find(v=>v.id===document.current_version_id);
 assert.ok(current&&current.approved&&current.state==='ready'&&current.text_status==='extracted'&&current.links.length,'Reviewed current product pages');assert.equal(current.sha256,expected.sha256,'Known original');assert.equal(document.status,'current');
 await request('/api/documents/'+document.id,'PATCH',{title:document.title,category:document.category,status:document.status,audience:'internal',knowledge_audience:'clients'});
 const saved=await request('/api/documents/'+document.id);assert.equal(saved.document.audience,'internal');assert.equal(saved.document.knowledge_audience,'clients');
}
const {link}=await request('/api/links','POST',{recipientName:'[Prueba técnica] Chat sin documentos',validDays:1,maxOpens:1});
try{
 const entry=await fetch(new URL('/guia/'+link.token,base),{headers:auth,redirect:'manual'});assert.equal(entry.status,303);const visitor={...auth,cookie:entry.headers.get('set-cookie').split(';')[0],'content-type':'application/json'};
 const answer=await request('/guia/'+link.token+'/asistente','POST',{question:'Complex Mocha Frasco contiene inulina'},visitor);assert.match(answer.message,/inulina de agave/i);assert.deepEqual(answer.sources,[]);
 for(const expected of config.documents){const {document}=await request('/api/documents/'+expected.id);assert.ok(!JSON.stringify(answer).includes(expected.id));assert.ok(!JSON.stringify(answer).includes(document.current_version_id));const file=await fetch(new URL('/guia/'+link.token+'/documentos/files/'+document.current_version_id,base),{headers:visitor});assert.equal(file.status,404);}
 const files=await request('/guia/'+link.token+'/documentos','GET',undefined,visitor);assert.deepEqual(files.documents,[]);
 console.log(JSON.stringify({configured:2,originals:'internal',knowledge:'clients',answer:answer.message,sourcesHidden:true,filesDenied:true}));
}finally{await request('/api/links/'+link.id,'PATCH');}


