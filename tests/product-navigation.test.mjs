import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productFamilies,productHref} from '../app/product-catalog.ts';
import {products} from '../app/portal-content.ts';

test('catalog shows one entry per family while search keeps the matching variant',()=>{
  const families=productFamilies(products,'');
  assert.equal(families.length,13);
  assert.equal(families.find(p=>p.product.family==='Active Pro').variants.length,3);
  const fresa=productFamilies(products,'fresa');
  assert.equal(fresa.length,1);
  assert.equal(fresa[0].product.id,'active-pro-fresa');
  assert.equal(fresa[0].variants.length,3);
});
test('product URLs retain the current scope and return search without fragments',()=>{
  for(const base of ['/admin/biblioteca','/asesor/token/biblioteca','/guia/token']){
    const url=new URL(productHref(base,'hc-fit','cápsulas & más',2),'https://example.test');
    assert.equal(url.pathname,base+'/productos/hc-fit');
    assert.equal(url.searchParams.get('q'),'cápsulas & más');
    assert.equal(url.searchParams.get('pagina'),'2');
    assert.equal(url.hash,'');
  }
});
