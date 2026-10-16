import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
if(!process.stdin.isTTY)throw new Error('Use an interactive terminal for hidden credentials.');
process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');process.stderr.write('Ready for assistant index JSON on stdin (input is hidden).\n');
let input='';const config=await new Promise((res,rej)=>process.stdin.on('data',chunk=>{input+=chunk;if(/[\r\n]/.test(input)){process.stdin.setRawMode(false);process.stdin.pause();try{res(JSON.parse(input))}catch(e){rej(e)}}}));
const base=new URL(config.url);assert.ok(base.protocol==='https:'&&base.hostname.endsWith('.chatgpt.site')||base.protocol==='http:'&&['localhost','127.0.0.1'].includes(base.hostname));
const authorization=config.token?{'OAI-Sites-Authorization':'Bearer '+config.token}:{};
const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{...authorization,'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD}),redirect:'manual'});assert.equal(login.status,200,'Admin login');
const headers={...authorization,cookie:login.headers.get('set-cookie').split(';')[0],'content-type':'application/json'};
async function post(path,body){const r=await fetch(new URL(path,base),{method:'POST',headers,body:JSON.stringify(body)});assert.equal(r.status,200,'Operation '+path);return r.json()}
let cursor=0,total=0;for(let batch=0;batch<10000;batch++){const result=await post('/api/assistant/index',{cursor});total+=result.indexed;cursor=result.cursor;if(result.done)break;assert.ok(batch<9999,'Index exceeded maintenance bound')}
const checks=[];for(const question of ['Complex Mocha Frasco contiene inulina','¿Puedo tomar Complex Mocha Frasco en ayunas?','Complex Mocha Frasco contiene plutonio','Estoy embarazada puedo tomar Complex Mocha en ayunas','¿Cuál es la dosis de HC-Fit?']){
 const answer=await post('/api/assistant',{question});checks.push({question,answer});
 if(question.includes('inulina')){assert.ok(answer.sources.length>0,'Actual document search');assert.ok(answer.sources.some(s=>/inulina/i.test(s.excerpt)));}
 if(question.includes('plutonio'))assert.equal(answer.sources.length,0);
 if(question.startsWith('Estoy embarazada')){assert.equal(answer.kind,'precaution');assert.equal(answer.sources.length,0)}
 if(question.includes('dosis de HC-Fit')){assert.equal(answer.sources.length,0);assert.match(answer.message,/confirmar/)}
}
const anonymous=await fetch(new URL('/api/assistant',base),{method:'POST',headers:{...authorization,'content-type':'application/json'},body:JSON.stringify({question:'Mocha inulina'})});assert.equal(anonymous.status,401);
await mkdir('outputs',{recursive:true});await writeFile('outputs/assistant-check.json',JSON.stringify({url:base.origin,indexed:total,checks},null,2));
console.log(JSON.stringify({indexed:total,checks:checks.map(c=>({question:c.question,kind:c.answer.kind,sources:c.answer.sources.map(s=>({title:s.title,version:s.version,page:s.page}))})),anonymousDenied:true}));
