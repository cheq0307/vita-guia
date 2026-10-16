import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planQuestion,buildAnswer} from '../app/assistant/policy.ts';
const page={documentId:'doc',title:'Ficha técnica',versionId:'v2',version:2,page:13,content:'Complex Mocha. Contiene inulina de agave y fibra. Preparación: mezclar una medida en agua caliente.'};
test('purpose questions recognize familiar phrasing and a transposed family word',()=>{
 for(const question of ['para que sirve el copmplex mocha','¿Para qué sirve Complex Mocha?','¿Qué beneficios tiene Mocha?','¿Para qué sirve?']){
  const plan=planQuestion(question,'complex-mocha-frasco');const answer=buildAnswer(plan,[]);
  assert.equal(answer.kind,'catalog',question);assert.match(answer.message,/complemento/i);assert.match(answer.message,/digestiv/i);assert.doesNotMatch(answer.message,/consultarlo con tu asesor|cura|regeneración|antitumoral|disminuye la resistencia/i);
 }
 const other=buildAnswer(planQuestion('¿Para qué sirve Ensure?','complex-mocha-frasco'),[]);assert.equal(other.kind,'missing');
 const typoIngredient=planQuestion('copmplex mocha contiene inulina');assert.ok(!typoIngredient.terms.includes('copmplex'));assert.deepEqual(typoIngredient.terms,['inulina']);
 const cautious=buildAnswer(planQuestion('¿Para qué sirve Complex Mocha si tengo diabetes?'),[]);assert.equal(cautious.kind,'precaution');
});
test('questions retain product context, resolve named variants and never mix unknown products',()=>{
 assert.deepEqual(planQuestion('¿Contiene inulina?','complex-mocha-frasco').productIds,['complex-mocha-frasco']);
 assert.deepEqual(planQuestion('Active Pro Fresa ingredientes').productIds,['active-pro-fresa']);
 assert.deepEqual(planQuestion('Espresso en ayunas','complex-mocha-frasco').productIds,['espresso']);
 assert.equal(planQuestion('Active Pro ingredientes').kind,'clarify');
 assert.equal(planQuestion('¿Qué sabores tiene Active Pro?').kind,'catalog');
 for(const other of ['Ensure','Herbalife']){const answer=buildAnswer(planQuestion('¿Qué ingredientes tiene '+other+'?','complex-mocha-frasco'),[]);assert.equal(answer.kind,'missing');assert.ok(!answer.message.includes('Extractos de cereza'));}
});
test('recognized product aliases reach the existing catalog answer',()=>{const alias=buildAnswer(planQuestion('¿Qué es Mocha?'),[]);assert.equal(alias.kind,'catalog');assert.match(alias.message,/Complemento alimenticio/)});
test('document answers cite exact stored origin and unknown questions do not gain unrelated citations',()=>{
 const plan=planQuestion('Complex Mocha contiene inulina');const answer=buildAnswer(plan,[page]);
 assert.equal(answer.kind,'documents');assert.match(answer.sources[0].excerpt,/inulina de agave/);
 assert.deepEqual({...answer.sources[0],excerpt:undefined},{documentId:'doc',title:'Ficha técnica',versionId:'v2',version:2,page:13,excerpt:undefined});
 const missing=buildAnswer(planQuestion('Complex Mocha contiene plutonio'),[page]);assert.equal(missing.sources.length,0);assert.match(missing.message,/No tengo ese dato confirmado/);
 assert.equal(buildAnswer(plan,[]).sources.length,0);
 const definition=buildAnswer(planQuestion('¿Qué es la inulina?','complex-mocha-frasco'),[page]);assert.equal(definition.kind,'documents');assert.ok(!definition.message.includes('Contenido:'));
});
test('medical precautions and unresolved doses cannot be overridden by retrieved PDF claims',()=>{
 const safety=buildAnswer(planQuestion('Estoy embarazada, puedo tomar Complex Mocha en ayunas'),[page]);assert.equal(safety.kind,'precaution');assert.match(safety.message,/no.*recomienda.*embarazo/i);assert.equal(safety.sources.length,0);
 const conflict=buildAnswer(planQuestion('¿Cuál es la dosis de HC-Fit?'),[{...page,content:'Tomar una cápsula antes del desayuno.'}]);assert.equal(conflict.kind,'catalog');assert.match(conflict.message,/confirmar/);assert.equal(conflict.sources.length,0);
 assert.equal(planQuestion('¿El Complex Mocha cura la diabetes?').kind,'precaution');
});
