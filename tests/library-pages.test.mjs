import { test } from 'node:test';
import assert from 'node:assert/strict';

test('separate catalog pages, searches and guide navigation preserve permissions and opening caps',{skip:!process.env.VITA_TEST_URL},async()=>{
  const base=new URL(process.env.VITA_TEST_URL);
  assert.ok(['localhost','127.0.0.1'].includes(base.hostname));
  const login=await fetch(new URL('/api/auth/login',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const headers={cookie,'content-type':'application/json'};
  for(const section of ['inicio','productos','videos','historias']){
    const path='/admin/biblioteca/'+section;
    assert.equal((await fetch(new URL(path,base),{redirect:'manual'})).status,307);
    const page=await fetch(new URL(path,base),{headers});
    assert.equal(page.status,200);
    const html=await page.text();
    assert.match(html,new RegExp('href="/admin/biblioteca/'+section+'"[^>]*aria-current="page"'));
    assert.match(html,/Panel administrativo/);
    if(section==='inicio') assert.ok(!html.includes('product-grid'));
    if(section==='productos'){assert.ok(html.includes('Active Pro'));assert.ok(!html.includes('video-catalog-card'));}
    if(section==='videos'){assert.ok(html.includes('video-catalog-card'));assert.ok(!html.includes('product-card'));}
    if(section==='historias'){assert.ok(html.includes('Mariana'));assert.ok(!html.includes('product-card'));}
  }
  const filtered=await(await fetch(new URL('/admin/biblioteca/productos?q=chocolate&pagina=999',base),{headers})).text();
  assert.ok(filtered.includes('Active Pro · Chocolate'));assert.ok(!filtered.includes('Active Pro · Fresa'));
  const empty=await(await fetch(new URL('/admin/biblioteca/videos?q=zzzz',base),{headers})).text();
  assert.ok(empty.includes('No encontramos coincidencias'));
  assert.equal((await fetch(new URL('/admin/biblioteca/desconocido',base),{headers})).status,404);

  const created=await fetch(new URL('/api/links',base),{method:'POST',headers,body:JSON.stringify({recipientName:'Prueba menús independientes',validDays:7,maxOpens:1})});
  assert.equal(created.status,201);
  const {link}=await created.json();
  const pending=await fetch(new URL('/guia/'+link.token+'/productos?q=chocolate&pagina=2',base),{redirect:'manual'});
  assert.equal(pending.status,307);
  const startUrl=new URL(pending.headers.get('location'),base);
  assert.equal(startUrl.searchParams.get('q'),'chocolate');
  assert.equal(startUrl.searchParams.get('pagina'),'2');
  const entry=await fetch(startUrl,{redirect:'manual'});
  assert.equal(entry.status,303);
  const destination=new URL(entry.headers.get('location'),base);
  assert.equal(destination.searchParams.get('q'),'chocolate');
  assert.equal(destination.searchParams.get('pagina'),'2');
  const guideCookie=entry.headers.get('set-cookie').split(';')[0];
  assert.match(entry.headers.get('set-cookie'),/HttpOnly/i);
  assert.match(entry.headers.get('set-cookie'),new RegExp('Path=/guia/'+link.token));
  for(const section of ['inicio','productos','videos','historias']){
    const route='/guia/'+link.token+'/'+section;
    const page=await fetch(new URL(route,base),{headers:{cookie:guideCookie},redirect:'manual'});
    assert.equal(page.status,200);
    const html=await page.text();assert.ok(!html.includes('Panel administrativo'));
    assert.ok(!html.includes('Cerrar sesión'));
    assert.equal((await fetch(new URL(route,base),{redirect:'manual'})).status,307);
  }
  const records=await(await fetch(new URL('/api/links',base),{headers})).json();
  assert.equal(records.links.find(item=>item.id===link.id).openCount,1);
  const exhausted=await(await fetch(new URL('/guia/'+link.token,base))).text();
  assert.match(exhausted,/alcanzó su límite/);
  assert.equal((await fetch(new URL('/guia/'+link.token,base),{headers:{cookie:guideCookie},redirect:'manual'})).status,303);
  await fetch(new URL('/api/links/'+link.id,base),{method:'PATCH',headers});
  const revoked=await(await fetch(new URL('/guia/'+link.token+'/productos',base),{headers:{cookie:guideCookie}})).text();
  assert.match(revoked,/Este enlace fue desactivado/);
  assert.ok(!revoked.includes('product-card'));

  const advisorResponse=await fetch(new URL('/api/advisors',base),{method:'POST',headers,body:JSON.stringify({name:'Prueba catálogos asesor',contact:'menus@example.test'})});
  assert.equal(advisorResponse.status,201);
  const {advisor}=await advisorResponse.json();
  for(const section of ['inicio','productos','videos','historias']) {
    const response=await fetch(new URL('/asesor/'+advisor.token+'/biblioteca/'+section,base));
    assert.equal(response.status,200);
    const html=await response.text();
    assert.ok(html.includes('Mi panel'));
    assert.ok(!html.includes('Panel administrativo'));
    assert.ok(!html.includes('Cerrar sesión'));
    assert.ok(html.includes('href="/asesor/'+advisor.token+'/biblioteca/productos"'));
  }
  await fetch(new URL('/api/advisors/'+advisor.id,base),{method:'PATCH',headers});
  const denied=await(await fetch(new URL('/asesor/'+advisor.token+'/biblioteca/productos',base))).text();
  assert.ok(denied.includes('Acceso no disponible'));
  assert.ok(!denied.includes('product-card'));
});
