import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planQuestion,buildAnswer} from '../app/assistant/policy.ts';
const reply=(question,id='complex-mocha-frasco',context=[],previous)=>buildAnswer(planQuestion(question,id??undefined,context,previous),[]);
test('ordinary spelling and conversational phrases reach the intended catalog answer',()=>{
 for(const q of ['pa q sirbe el mocha','para k sirve el complex moca','q beneficios tiene el mocha','me puedes decir para qué sirve el mocha porfa']){const a=reply(q);assert.equal(a.kind,'catalog',q);assert.match(a.message,/digestivo/)}
 for(const q of ['q lleva el mocha','de que esta hecho','cuales son sus componentes','me dices los ingredientes por favor']){const a=reply(q);assert.equal(a.kind,'catalog',q);assert.match(a.message,/inulina/)}
 for(const q of ['y como lo tomo','como se usa','como lo preparo','cómo se consume']){const a=reply(q);assert.equal(a.kind,'catalog',q);assert.match(a.message,/agua tibia|agua caliente/)}
 for(const q of ['y lo puedo tomar con el estomago vacio','y antes de desayunar'])assert.match(reply(q).message,/ayunas/);
 for(const q of ['¿Para qué sirve Complex Mocha?','para que sirve el copmplex mocha','para que sirve el comple mocha'])assert.equal(reply(q,null).kind,'catalog',q);
});
test('clarification keeps the family until a flavor is chosen, without assuming a presentation',()=>{
 const first=reply('ingredientes de active pro',null);assert.equal(first.kind,'clarify');assert.equal(first.contextProductIds.length,3);
 const still=reply('y como se prepara',null,first.contextProductIds);assert.equal(still.kind,'clarify');
 const second=reply('el de fresa',null,first.contextProductIds,'ingredientes de active pro');assert.equal(second.productId,'active-pro-fresa');assert.equal(second.kind,'catalog');assert.match(second.message,/fresa/i);assert.match(second.message,/proteína|ingredientes/i);
 const changed=reply('y el mocha para que sirve',null,first.contextProductIds);assert.match(changed.message,/Complex Mocha/);
});
test('greetings and underspecified questions are useful without inventing a product',()=>{
 assert.match(reply('hola',null).message,/Hola/);
 assert.equal(reply('para que sirve',null).kind,'clarify');
 assert.equal(reply('que ingredientes tiene',null).kind,'clarify');
 assert.equal(reply('para que sirve ensure').kind,'missing');
 assert.equal(reply('mocha y stormix para que sirven',null).kind,'clarify');
});
test('language normalization never erases an unknown ingredient or a health qualifier',()=>{
 assert.equal(reply('me puedes decir si mocha lleva plutonio porfa').kind,'missing');
 assert.equal(reply('pa q sirve el mocha si tengo diabetes').kind,'precaution');
 assert.equal(reply('como lo tomo si estoy embarazada').kind,'precaution');
 for(const q of ['puedo tomar mocha','lo puedo tomar','debo tomar mocha']){assert.equal(reply(q).kind,'precaution',q);assert.match(reply(q).message,/consulta|profesional|recomienda/i)}
 assert.equal(reply('como se prepara el hc fit',null).kind,'catalog');assert.match(reply('como se prepara el hc fit',null).message,/confirmar/);
});

