import {test} from 'node:test';import assert from 'node:assert/strict';
test('v2 scoped destinations retain authorization and chat navigation does not consume a second guide opening',{skip:!process.env.VITA_TEST_URL},async()=>{
 const base=new URL(process.env.VITA_TEST_URL);assert.ok(['127.0.0.1','localhost'].includes(base.hostname));
 const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});assert.equal(login.status,200);const headers={cookie:login.headers.get('set-cookie').split(';')[0],'content-type':'application/json'};
 const routes=['/admin','/admin/enlaces','/admin/contenido','/admin/consulta','/admin/mas','/admin/aportaciones','/admin/biblioteca/chat'];
 for(const path of routes){const denied=await fetch(new URL(path,base),{redirect:'manual'});assert.equal(denied.status,307,path);const allowed=await fetch(new URL(path,base),{headers});assert.equal(allowed.status,200,path);assert.match(await allowed.text(),/data-version="2.0.0"/)}
 const created=await fetch(new URL('/api/advisors',base),{method:'POST',headers,body:JSON.stringify({name:'V2 access test',contact:'v2@example.test'})});const{advisor}=await created.json();
 let link;try{
  const scope='/asesor/'+advisor.token;
  for(const path of ['/enlaces','/mas','/biblioteca/chat']){const r=await fetch(new URL(scope+path,base));assert.equal(r.status,200);const html=await r.text();assert.ok(!html.includes('href="/admin/usuarios"'));assert.ok(!html.includes('action="/api/auth/logout"'))}
  const made=await fetch(new URL('/api/links',base),{method:'POST',headers,body:JSON.stringify({recipientName:'V2 guide test',recipientContact:'',validDays:1,maxOpens:1})});link=(await made.json()).link;
  const entry=await fetch(new URL('/guia/'+link.token+'?seccion=chat&producto=active-pro-fresa',base),{redirect:'manual'});assert.equal(entry.status,303);const chatDestination=new URL(entry.headers.get('location'),base);assert.match(chatDestination.pathname,/\/chat$/);assert.equal(chatDestination.searchParams.get('producto'),'active-pro-fresa');const cookie=entry.headers.get('set-cookie').split(';')[0];
  for(const part of ['chat','productos','chat']){const response=await fetch(new URL('/guia/'+link.token+'/'+part,base),{headers:{cookie}});assert.equal(response.status,200);const html=await response.text();assert.ok(!html.includes('Panel administrativo'));assert.ok(!html.includes('href="/admin'));assert.ok(!html.includes('href="/api/documents/files/'));assert.ok(!html.includes('Cerrar sesión'))}
  const list=await(await fetch(new URL('/api/links',base),{headers})).json();assert.equal(list.links.find(x=>x.id===link.id).openCount,1);
 }finally{if(link)await fetch(new URL('/api/links/'+link.id,base),{method:'PATCH',headers});await fetch(new URL('/api/advisors/'+advisor.id,base),{method:'PATCH',headers})}
});
