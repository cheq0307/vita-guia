import {products,answerQuestion} from '../portal-content.ts';
import type {SearchPage} from '../../db/document-search';
import type {AssistantAnswer,AnswerSource} from './types';
import {naturalAnswer} from './natural-answer.ts';
import {normalizeQuestion} from './question-language.ts';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const compact=(value:string)=>normalize(value).replace(/[^a-z0-9]/g,'');
const stop=new Set('a al algo antes acerca con como cual cuales cuando de del dice documento documentos el ella en es esta este ficha guia hay informacion la las lo los me mi para por producto productos puede puedo que se segun si sin sobre su sus tecnica tiene tienen tomar un una unos uso contiene saber quiero favor dime pdf catalogo y sus son lleva incluye puedo lo le el'.split(' '));
const stems=(word:string)=>word.replace(/^(ingredientes?|composicion|preparacion|preparar|beneficios?|vitaminas?|ayunas?|precauciones?|advertencias?)$/,(w)=>({ingredientes:'ingredien',ingrediente:'ingredien',composicion:'compos',preparacion:'prepar',preparar:'prepar',beneficios:'benefici',beneficio:'benefici',vitaminas:'vitamin',vitamina:'vitamin',ayunas:'ayuna',ayuna:'ayuna',precauciones:'precaucion',precaucion:'precaucion',advertencias:'advertencia',advertencia:'advertencia'}[w]??w));
export type QuestionPlan={kind:AssistantAnswer['kind'];message:string;productIds:string[];terms:string[];required:string[];search:boolean;question?:string};
export function planQuestion(question:string,contextId?:string,contextIds:string[]=[],previousQuestion?:string):QuestionPlan{
 question=normalizeQuestion(question,products.map(p=>p.family+' '+p.presentation));
 const value=compact(question);const context=products.find(p=>p.id===contextId);
 const explicit=products.filter(p=>{const family=compact(p.family);const alias=family.replace(/^complex/,'').replace(/plus$/,'');return value.includes(family)||(alias.length>=4&&value.includes(alias))});
 const previousProducts=products.filter(p=>contextIds.includes(p.id));
 let matches=explicit.length?explicit:previousProducts.length?previousProducts:context?[context]:[];
 const families=[...new Set(matches.map(p=>p.family))];
 if(families.length>1)return {kind:'clarify',message:'Consulta un producto a la vez para distinguir sus fuentes.',productIds:[],terms:[],required:[],search:false};
 const variants=matches.filter(p=>value.includes(compact(p.presentation))||p.presentation==='Stick'&&/sticks/.test(value));
 if(variants.length===1)matches=variants;else if(context&&matches.some(p=>p.id===context.id))matches=[context];
 const product=matches[0];
 const productWords=new Set(matches.flatMap(p=>normalize(p.family+' '+p.presentation).match(/[a-z0-9]+/g)??[]));
 const words=(normalize(question).match(/[a-z0-9]+/g)??[]).filter(w=>w.length>2&&!stop.has(w)&&!productWords.has(w));
 if(/^(hola|buenas|buenos dias|buenas tardes|buenas noches|gracias|muchas gracias)[!.?\s]*$/.test(question))return {kind:'catalog',message:/gracias/.test(question)?'¡Con gusto! Puedes hacerme otra pregunta sobre tus productos.':'¡Hola! ¿Sobre qué producto te gustaría preguntar?',productIds:matches.map(p=>p.id),terms:[],required:[],search:false,question};
 if(!product&&words.every(w=>/^(sirve|benefici|ingredien|compos|prepar|precaucion|advertencia|ayuna|dosis|cantidad|sabor|presentacion|funcion|utilidad)/.test(w)))return {kind:'clarify',message:'¿Sobre qué producto quieres saber? Escribe su nombre y, si tiene varias presentaciones, cuál usas.',productIds:[],terms:[],required:[],search:false,question};
 if(!explicit.length&&variants.length===1&&words.length===0&&previousQuestion){
  const previous=planQuestion(previousQuestion,contextId,contextIds);
  if((previous.kind==='clarify'||previous.kind==='precaution')&&previous.productIds.includes(product.id))return planQuestion(previousQuestion,product.id,[product.id]);
 }
 // Residual names/topics must be searched, never silently answered as the previous product.
 const catalogOnly=words.every(w=>/^(persona|alguien|sirve|sirven|funcion|utilidad|ingredien|compos|prepar|benefici|precaucion|advertencia|contraindic|embaraz|lactan|amamant|alerg|enfermedad|diabet|hipertens|gastrit|padez|diagnost|medicamento|antibiotic|tratamiento|segur|ayuna|dosis|cantidad|indicacion|horario|hora|presentacion|variante|sabor|pendiente|confirmar|descripcion|cuentame|sustitu|comida|fragancia|vegetal|endulzan|origen)/.test(w));
 const effective=product?product.family+(matches.length===1?' '+product.presentation:'')+' '+question+(/contien/.test(value)&&words.length===0?' ingredientes':''):question;
 const prepared=answerQuestion(effective);
 const result:QuestionPlan={kind:'missing',message:prepared,productIds:matches.map(p=>p.id),terms:[],required:[],search:true,question};
 if(/precauciones indicadas|las precauciones dependen/i.test(prepared))return {...result,kind:'precaution',search:false};
 if(product&&!words.length&&!/contien/.test(value))return {...result,kind:'catalog',message:answerQuestion(product.family+' '+product.presentation+' descripción'),search:false};
 if(/precaucion|advertencia|contraindic|embaraz|lactan|amamant|doypecho|dandopecho|alerg|enfermedad|diabet|hipertens|gastrit|padez|diagnost|tengo|medicamento|antibiotic|tratamiento|segur|cura|garantiz/.test(value))return {...result,kind:'precaution',message:product&&(explicit.length>0||catalogOnly)?prepared:'Esta guía no determina tratamientos ni si un producto es adecuado para ti. Consulta la etiqueta y a tu profesional de salud.',search:false};
 if(product&&catalogOnly&&/presentacion|variante|sabor|pendiente|confirmar|hora|horario/.test(value))return {...result,kind:'catalog',search:false};
 if(product&&matches.length>1&&/ingredien|compos|contien|prepar|dosis|cantidad/.test(value)&&matches.some(p=>p.ingredients!==product.ingredients||p.usage!==product.usage))return {...result,kind:'clarify',message:`Selecciona la presentación de ${product.family}: ${matches.map(p=>p.presentation).join(', ')}. La información puede variar.`,search:false};
 if(product&&/prepar|tom|consum|us|dosis|cantidad|indicacion/.test(value)&&product.pending.some(p=>/difier|conflict|cantidad.*indicacion|indicacion.*cantidad/i.test(p)))return {...result,kind:'catalog',message:answerQuestion(product.family+' '+product.presentation+' indicaciones de uso'),search:false};
 result.required=[...new Set(words.map(stems))].slice(0,12);
 if(/ayunas|estomagovacio|antesdedesayunar|antesdeldesayuno/.test(value))result.required=['ayuna'];
 if(/comoseprepara|comoprepar|preparacion/.test(value))result.required=['prepar'];
 result.terms=result.required;
 if(product&&catalogOnly&&!/No encuentro|no especifica|no indica|por confirmar/i.test(prepared)&&!(/quees|descripcion|cuentame/.test(value)&&result.required.length>0))result.kind='catalog';
 return result;
}
function excerpt(content:string,terms:string[]){
 const text=content.replace(/\s+/g,' ').trim();const normalized=normalize(text);
 const positions=terms.map(t=>normalized.indexOf(t)).filter(n=>n>=0);const at=positions.length?Math.min(...positions):0;
 const previous=text.lastIndexOf('. ',at);const from=previous>=0&&at-previous<260?previous+2:Math.max(0,at-100);
 const next=text.indexOf('. ',at);const to=next>=at&&next-from<480?next+1:Math.min(text.length,from+480);
 return (from?'…':'')+text.slice(from,to)+(to<text.length?'…':'');
}
export function buildAnswer(plan:QuestionPlan,pages:SearchPage[]):AssistantAnswer{
 const answer=naturalAnswer(buildRawAnswer(plan,pages),plan.question??'',products.find(p=>p.id===plan.productIds[0])?.family,plan.required);
 if(answer.kind==='clarify'&&plan.productIds.length>1)answer.choices=products.filter(p=>plan.productIds.includes(p.id)).map(p=>({label:p.presentation,question:p.presentation}));
 return answer;
}
function buildRawAnswer(plan:QuestionPlan,pages:SearchPage[]):AssistantAnswer{
 const result:AssistantAnswer={kind:plan.kind,message:plan.message,sources:[],contextProductIds:plan.productIds,...(plan.productIds.length===1?{productId:plan.productIds[0]}:{})};
 if(!plan.search||!plan.required.length)return result;
 const relevant=pages.filter(page=>plan.required.every(term=>normalize(page.content).includes(term))).slice(0,3);
 if(!relevant.length)return {...result,message:plan.kind==='catalog'?plan.message:'No encontré esa respuesta en las fichas ni en los documentos vigentes disponibles para tu acceso. Puedes preguntar a la persona que te compartió la guía.'};
 result.sources=relevant.map(({content,...origin}):AnswerSource=>({...origin,excerpt:excerpt(content,plan.required)}));
 if(plan.kind!=='catalog'){result.kind='documents';result.message='Esto es lo que mencionan los documentos vigentes sobre tu consulta:'}
 return result;
}
