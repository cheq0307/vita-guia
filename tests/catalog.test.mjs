import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogPage, isPortalSection, portalHref } from '../app/portal-navigation.ts';
import { createGuideVisit, hasGuideVisit } from '../app/guide-visit.ts';

test('catalog search ignores accents and paging clamps malformed or outdated page numbers', () => {
  const items=Array.from({length:22},(_,i)=>({name:`Nutrición ${i+1}`}));
  const first=catalogPage(items,'nutricion',1,item=>item.name);
  assert.equal(first.total,22); assert.equal(first.items.length,9); assert.equal(first.pages,3);
  assert.equal(catalogPage(items,'nutrición',2,item=>item.name).items[0].name,'Nutrición 10');
  assert.equal(catalogPage(items,'',999,item=>item.name).page,3);
  assert.equal(catalogPage(items,'',NaN,item=>item.name).page,1);
  const empty=catalogPage(items,'sin resultados',4,item=>item.name);
  assert.deepEqual(empty.items,[]); assert.equal(empty.page,1);
});
test('section URLs remain inside the current admin, advisor or customer library', () => {
  for(const base of ['/admin/biblioteca','/asesor/abc/biblioteca','/guia/abc']) {
    assert.equal(portalHref(base,'productos'),base+'/productos');
    assert.equal(portalHref(base,'inicio'),base+'/inicio');
    assert.ok(!portalHref(base,'videos','té & agua',2).includes('#'));
    const url=new URL(portalHref(base,'videos','té & agua',2),'https://example.test');
    assert.equal(url.searchParams.get('q'),'té & agua');
    assert.equal(url.searchParams.get('pagina'),'2');
  }
  assert.equal(isPortalSection('productos'),true);
  assert.equal(isPortalSection('admin'),false);
});
test('signed guide visits are scoped to one link and expire without granting admin access', () => {
  const secret='unit-test-secret-not-used-in-production';
  const now=Date.parse('2026-10-15T12:00:00Z');
  const visit=createGuideVisit('link-a','2026-10-15T13:00:00Z',secret,now);
  assert.equal(hasGuideVisit(visit,'link-a',secret,now+1000),true);
  assert.equal(hasGuideVisit(visit,'link-b',secret,now),false);
  assert.equal(hasGuideVisit(visit+'x','link-a',secret,now),false);
  assert.equal(hasGuideVisit(visit,'link-a','different',now),false);
  assert.equal(hasGuideVisit(visit,'link-a',secret,now+3600000),false);
  assert.equal(hasGuideVisit(null,'link-a',secret,now),false);
});
