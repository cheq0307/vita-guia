import {test} from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../app/portal-content.ts';
import {planQuestion,buildAnswer} from '../app/assistant/policy.ts';
import {productQuestions,productQuestionAnswer,detectProductQuestion} from '../app/assistant/product-questions.ts';
test('the 26 requested questions have a distinct reviewed answer for every catalog presentation',()=>{
 assert.equal(productQuestions.length,26);assert.equal(products.length,17);let count=0;
 for(const product of products)for(const item of productQuestions){
  const topic=detectProductQuestion(item.question,products);assert.equal(topic,item.id,product.id+' '+item.question);
  const expected=productQuestionAnswer(product,item.id);assert.ok(expected.message.length>25);assert.ok(['available','partial','missing','conflict','not_applicable'].includes(expected.status));
  const result=buildAnswer(planQuestion(item.question,product.id),[]);assert.notEqual(result.kind,'missing',product.id+' '+item.id);assert.doesNotMatch(result.message,/^No tengo ese dato confirmado\.$/);assert.equal(result.productId,product.id);count++;
 }
 assert.equal(count,442);
});
test('every product has a purpose and an explicit benefits review, without inventing Hemp-C efficacy',()=>{
 for(const product of products){assert.ok(product.purpose?.length>30,product.id);assert.ok(Array.isArray(product.benefits),product.id)}
 const hemp=products.find(p=>p.id==='hemp-c');assert.equal(productQuestionAnswer(hemp,'benefits').status,'missing');assert.doesNotMatch(productQuestionAnswer(hemp,'benefits').message,/analgésico|epilep|antipsicót/i);
 for(const product of products.filter(p=>p.id!=='hemp-c'))assert.ok(product.benefits.length>=2,product.id);
});
test('common five phrasings reach topic answers while unknown qualifiers and personal medical safety stay isolated',()=>{
 for(const product of products)for(const question of ['para que sirve','que beneficios tiene','que contiene','como se toma','que riesgos tiene','cuanto cuesta'])assert.notEqual(buildAnswer(planQuestion(question,product.id),[]).kind,'missing',product.id+' '+question);
 assert.equal(buildAnswer(planQuestion('mocha contiene plutonio'),[]).kind,'missing');
 assert.equal(buildAnswer(planQuestion('para que sirve Ensure','complex-mocha-frasco'),[]).kind,'missing');
 assert.equal(buildAnswer(planQuestion('Estoy embarazada puedo tomar Mocha'),[]).kind,'precaution');
 assert.equal(buildAnswer(planQuestion('Active Pro cura la diabetes'),[]).kind,'precaution');
 assert.equal(buildAnswer(planQuestion('que ingredientes tiene Active Pro'),[]).kind,'clarify');
});
test('missing clinical, price and batch evidence cannot turn into verified results or invented instructions',()=>{
 for(const product of products){
  for(const id of ['studies','results_time','long_term','missed','interactions','quality','sanitary','purchase','expiry'])assert.ok(['missing','partial','not_applicable'].includes(productQuestionAnswer(product,id).status),product.id+' '+id);
  assert.match(productQuestionAnswer(product,'price_duration').message,/precio.*confirmado/i);
  assert.doesNotMatch(productQuestionAnswer(product,'studies').message,/demostrado científicamente|clínicamente probado/i);
 }
 const gel=products.find(p=>p.id==='re-new-pro');assert.equal(productQuestionAnswer(gel,'with_food').status,'not_applicable');assert.match(productQuestionAnswer(gel,'usage').message,/tópico|piel/);
 for(const id of ['active-pro-chocolate','active-pro-fresa','active-pro-tropical','hc-fit'])assert.equal(productQuestionAnswer(products.find(p=>p.id===id),'portion').status,'conflict');
 assert.equal(productQuestionAnswer(products.find(p=>p.id==='hemp-c'),'portion').status,'missing');
 assert.match(productQuestionAnswer(products.find(p=>p.id==='ahcc-plus'),'price_duration').message,/30 días/);
});
test('medical qualifiers take precedence over dosage, preparation and classification',()=>{
 for(const question of ['cual es la dosis de Stormix en embarazo','como se toma Mocha en embarazo','como se toma Stormix en lactancia','cual es la dosis de Stormix para ninos']){const result=buildAnswer(planQuestion(question),[]);assert.equal(result.kind,'precaution',question);assert.doesNotMatch(result.message,/sachet de 10|Una medida|200 ml|250 ml/);assert.match(result.message,/embarazo|adultos|lactancia/i)}
 const medicines=buildAnswer(planQuestion('como se toma Support+ con medicamentos'),[]);assert.equal(medicines.kind,'precaution');assert.match(medicines.message,/interacciones|combinación/);assert.doesNotMatch(medicines.message,/se presenta como/);
 const allergy=buildAnswer(planQuestion('como se toma Support+ con alergia'),[]);assert.equal(allergy.kind,'precaution');assert.match(allergy.message,/leche|huevo/);
 const literal=buildAnswer(planQuestion('es un suplemento alimenticio o un medicamento','support-plus'),[]);assert.equal(literal.kind,'catalog');assert.match(literal.message,/complemento|suplemento/);
 const mixed=buildAnswer(planQuestion('como se toma Mocha en embarazo con alergia'),[]);assert.equal(mixed.kind,'precaution');assert.match(mixed.message,/no.*recomienda.*embarazo/i);assert.doesNotMatch(mixed.message,/200 ml|una medida/i);
});
test('a partial name of another product cannot borrow the previous product facts',()=>{
 for(const q of ['beneficios de active','para que sirve complex green','beneficios de re-new']){const result=buildAnswer(planQuestion(q,'complex-mocha-frasco'),[]);assert.ok(!result.message.includes('cacao'),q);assert.ok(!result.message.includes('bienestar digestivo')||/Green/.test(result.message),q)}
 assert.equal(buildAnswer(planQuestion('beneficios de active','complex-mocha-frasco'),[]).kind,'missing');
 assert.ok(planQuestion('para que sirve complex green','complex-mocha-frasco').productIds.every(id=>id.startsWith('complex-green-leaves')));
});
