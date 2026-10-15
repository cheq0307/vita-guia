import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {products, answerQuestion} from '../app/portal-content.ts';

test('catalog preserves real variants, source references and unresolved instructions',()=>{
  assert.equal(products.length,17);
  assert.equal(new Set(products.map(p=>p.id)).size,17);
  assert.equal(new Set(products.map(p=>p.family)).size,13);
  for(const p of products){
    assert.ok(existsSync(new URL('../public'+p.image,import.meta.url)));
    assert.ok(p.source.length>0);
    assert.equal('time' in p,false);
    if(p.family==='Active Pro'||p.family==='HC-Fit'){
      assert.equal(p.usage,null);
      assert.ok(p.pending.some(s=>s.includes('indicaciones')));
    }
  }
});
test('assistant does not invent quantities, schedules or answers for unknown products',()=>{
  assert.match(answerQuestion('Cómo tomo HC-Fit'),/por confirmar/i);
  assert.match(answerQuestion('Cómo preparo Active Pro'),/por confirmar/i);
  assert.match(answerQuestion('A qué hora tomo Support+'),/horario personalizado/i);
  assert.match(answerQuestion('Cómo preparo Fibras +'),/No encuentro/);
  assert.match(answerQuestion('Qué precauciones tiene Support+'),/precauciones.*por confirmar/i);
  assert.ok(!answerQuestion('Qué es Support+').includes('al día'));
  assert.ok(!answerQuestion('Puedo tomar Support+ embarazada').includes('3 cápsulas'));
  assert.ok(!/8:00|2:00|9:30/.test(products.map(p=>JSON.stringify(p)).join('')));
});
