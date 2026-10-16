import {test} from 'node:test';
import assert from 'node:assert/strict';
import {products,answerQuestion} from '../app/portal-content.ts';

test('fiches include source descriptions and known content instead of generic pending fields',()=>{
  for(const product of products){
    assert.ok(product.description.length>50,product.id+' description');
    assert.ok(product.features.length>=2,product.id+' characteristics');
  }
  assert.equal(products.find(p=>p.id==='active-pro-fresa').package,'770 g · 14 porciones');
  assert.equal(products.find(p=>p.id==='complex-mocha-frasco').package,'280 g · 28 porciones');
  assert.equal(products.find(p=>p.id==='espresso').package,'84 g · 28 porciones');
  assert.equal(products.find(p=>p.id==='macchiato').package,'280 g · 28 porciones');
});
test('available preparation and precautions are transcribed while source conflicts remain unresolved',()=>{
  for(const id of ['complex-mocha-frasco','complex-mocha-stick','complex-green-leaves-frasco','complex-green-leaves-stick']){
    const product=products.find(p=>p.id===id);
    assert.match(product.usage,/200 ml/);
    assert.ok(product.warnings.some(w=>/embaraz/.test(w)));
  }
  const renew=products.find(p=>p.id==='re-new-pro');
  assert.ok(renew.warnings.some(w=>/prueba/.test(w)));
  assert.match(answerQuestion('Qué precauciones tiene Complex Mocha'),/embaraz/);
  for(const product of products.filter(p=>['Active Pro','HC-Fit'].includes(p.family)))assert.equal(product.usage,null);
});

test('assistant resolves natural flavor names and cites only available sources',()=>{
  assert.match(answerQuestion('Qué precauciones tiene Active Pro de Fresa'),/intolerancia a la lactosa/);
  assert.ok(!answerQuestion('Qué precauciones tiene Active Pro de Fresa').includes('fibra de soya'));
  assert.match(answerQuestion('Qué precauciones tiene Active Pro'),/elige|selecciona/i);
  assert.match(answerQuestion('Qué falta confirmar de Re-New Pro'),/No hay.*pendientes/i);
  assert.ok(!answerQuestion('Qué ingredientes tiene Espresso').includes('ficha técnica'));
});
