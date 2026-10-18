import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answerQuestion} from '../app/portal-content.ts';

test('natural fasting questions answer the actual source fact instead of the product description',()=>{
  for(const question of ['el complex mocha se puede tomar en ayunas','¿Puedo tomar Complex Mocha en ayunas?','Complex Mocha Stick antes de desayunar']){
    const answer=answerQuestion(question);
    assert.match(answer,/en ayunas/);
    assert.doesNotMatch(answer,/ficha técnica|Fuente:|según/i);
    assert.ok(!answer.includes('Contenido:'));
  }
  assert.match(answerQuestion('Stormix en ayunas'),/puede consumirse en ayunas/i);
  assert.match(answerQuestion('Espresso en ayunas'),/no especifica|no indica/i);
});
test('source FAQs are reused without overriding medical precautions or inventing unknown answers',()=>{
  assert.match(answerQuestion('Re-New Pro tiene fragancia'),/sin fragancias/);
  assert.match(answerQuestion('Complex Mocha puede sustituir una comida'),/No\./);
  assert.match(answerQuestion('Estoy embarazada, puedo tomar Complex Mocha en ayunas'),/no.*recomienda.*embarazo/i);
  for(const question of ['Estoy lactando, puedo tomar Complex Mocha en ayunas','Estoy amamantando, puedo tomar Stormix antes de desayunar','Tengo gastritis, puedo tomar Complex Mocha en ayunas']){
    assert.match(answerQuestion(question),/Precauciones indicadas/);
    assert.ok(!answerQuestion(question).includes('preferentemente en ayunas'));
  }
  const unknown=answerQuestion('Complex Mocha interactúa con antibióticos');
  assert.match(unknown,/No encuentro|no determina/i);
  assert.ok(!unknown.includes('Contenido:'));
});
