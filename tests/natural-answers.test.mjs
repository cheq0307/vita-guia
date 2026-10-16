import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planQuestion,buildAnswer} from '../app/assistant/policy.ts';
const page={documentId:'doc',title:'Ficha técnica',versionId:'v1',version:1,page:33,content:'Complejo gastrointestinal: Fibra de manza- na, diente de león, extracto de canela, clavo de olor, inulina de agave.'};
test('ingredient questions get a short conversational answer with separate traceability',()=>{
 const result=buildAnswer(planQuestion('¿Contiene inulina?','complex-mocha-stick'),[page]);
 assert.equal(result.message,'Sí, Complex Mocha contiene inulina de agave.');
 assert.equal(result.sources[0].page,33);assert.match(result.sources[0].excerpt,/inulina de agave/);
 assert.doesNotMatch(result.message,/document|ficha|según|en base|Fuente:|Complejo gastrointestinal|manza-/i);
});
test('catalog replies lose institutional preambles without losing medical cautions or uncertainty',()=>{
 const fasting=buildAnswer(planQuestion('Complex Mocha en ayunas'),[page]);assert.doesNotMatch(fasting.message,/ficha|según|Fuente:|material recibido/i);assert.match(fasting.message,/preferentemente en ayunas/);
 const safety=buildAnswer(planQuestion('Estoy embarazada, puedo tomar Complex Mocha'),[page]);assert.match(safety.message,/no.*recomienda.*embarazo/i);assert.equal(safety.sources.length,0);
 const unknown=buildAnswer(planQuestion('Complex Mocha contiene plutonio'),[page]);assert.match(unknown.message,/confirmado/);assert.equal(unknown.sources.length,0);
});
test('a negative ingredient statement cannot become an affirmative answer',()=>{
 const result=buildAnswer(planQuestion('¿Contiene inulina?','complex-mocha-stick'),[{...page,content:'No contiene inulina.'}]);
 assert.doesNotMatch(result.message,/^Sí/);assert.match(result.message,/no contiene inulina/i);
 const list=buildAnswer(planQuestion('¿Contiene inulina?','complex-mocha-stick'),[{...page,content:'No contiene azúcar, gluten ni inulina.'}]);assert.doesNotMatch(list.message,/^Sí/);assert.match(list.message,/No contiene azúcar, gluten ni inulina/);
});
