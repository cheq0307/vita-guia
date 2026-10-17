import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planQuestion,buildAnswer} from '../app/assistant/policy.ts';
import {products} from '../app/portal-content.ts';
test('the reported conversation distinguishes purpose, benefits and diabetes and retains the medical question after flavor selection',()=>{
 let productId;let context=[];let previous;
 function ask(question){const answer=buildAnswer(planQuestion(question,productId,context,previous),[]);if(answer.kind!=='missing'){productId=answer.productId??productId;context=answer.contextProductIds??context;previous=question}return answer}
 const flavors=ask('¿Qué sabores tiene Active Pro?');assert.match(flavors.message,/Chocolate, Fresa, Tropical/);
 const purpose=ask('para que sirve?');assert.equal(purpose.kind,'catalog');assert.match(purpose.message,/alimentación|nutricional/i);assert.doesNotMatch(purpose.message,/Chocolate|Contenido:/);
 const benefits=ask('que beneficios tiene');assert.notEqual(benefits.message,purpose.message);assert.match(benefits.message,/saciedad/i);assert.match(benefits.message,/energía/i);assert.ok(benefits.message.includes('\n• '));assert.doesNotMatch(benefits.message,/regula.*glucosa|presión arterial|garantiz|50%|30 g/i);
 const diabetes=ask('sirve para alguien con diabetes?');assert.equal(diabetes.kind,'precaution');assert.match(diabetes.message,/diabetes/i);assert.match(diabetes.message,/carbohidratos/i);assert.doesNotMatch(diabetes.message,/pediatra|infantil|soya|alerg/i);
 const chosen=ask('chocolate');assert.equal(chosen.kind,'precaution');assert.equal(chosen.productId,'active-pro-chocolate');assert.match(chosen.message,/diabetes/i);assert.doesNotMatch(chosen.message,/Contenido:|pediatra|infantil/);
 const repeat=ask('sirve para personas con diabetes?');assert.equal(repeat.kind,'precaution');assert.match(repeat.message,/diabetes/i);assert.match(repeat.message,/carbohidratos/i);
});
test('each Active Pro presentation exposes reviewed benefits as structured product content',()=>{
 for(const product of products.filter(p=>p.family==='Active Pro')){assert.ok(product.purpose);assert.ok(product.benefits.length>=3);assert.ok(product.benefits.some(b=>/saciedad/i.test(b)));assert.ok(product.benefits.some(b=>/energía/i.test(b)))}
});
test('diabetes context cannot suppress pregnancy or invent glucose control',()=>{
 const answer=buildAnswer(planQuestion('Estoy embarazada y tengo diabetes, puedo tomar Mocha'),[]);assert.equal(answer.kind,'precaution');assert.match(answer.message,/no.*recomienda.*embarazo/i);
 const unknown=buildAnswer(planQuestion('Ensure sirve para personas con diabetes','active-pro-chocolate'),[]);assert.ok(!unknown.message.includes('Active Pro'));
});
test('a diabetes question retains explicit ingredient restrictions',()=>{
 const soy=buildAnswer(planQuestion('Tengo diabetes y alergia a la soya, puedo tomar Active Pro chocolate?'),[]);assert.match(soy.message,/diabetes/);assert.match(soy.message,/soya/);assert.doesNotMatch(soy.message,/pediatra|infantil/);
 const lactose=buildAnswer(planQuestion('Tengo diabetes e intolerancia a la lactosa, sirve Active Pro fresa?'),[]);assert.match(lactose.message,/diabetes/);assert.match(lactose.message,/no es apto.*intolerancia a la lactosa/);
 const family=buildAnswer(planQuestion('Tengo diabetes y alergias, puedo tomar Active Pro?'),[]);assert.match(family.message,/diabetes/);assert.match(family.message,/sabor|presentación/);assert.ok(!family.productId);
});
