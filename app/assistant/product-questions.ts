import type {Product} from '../portal-content';
import {knowledgeByFamily} from '../product-knowledge.ts';
import {normalizeQuestion,productAliases} from './question-language.ts';
export const productQuestions=[
 {id:'purpose',question:'¿Qué es este producto y para qué sirve?'},
 {id:'benefits',question:'¿Qué beneficios ofrece?'},
 {id:'ingredients',question:'¿Qué ingredientes contiene y en qué cantidades?'},
 {id:'comparison',question:'¿En qué se diferencia de otros productos similares?'},
 {id:'classification',question:'¿Es un suplemento alimenticio o un medicamento?'},
 {id:'studies',question:'¿Hay estudios científicos que respalden sus beneficios?'},
 {id:'results_time',question:'¿En cuánto tiempo podría notar resultados?'},
 {id:'variation',question:'¿Los resultados pueden variar entre personas?'},
 {id:'expectations',question:'¿Qué puedo esperar realmente del producto?'},
 {id:'portion',question:'¿Cuál es la porción diaria recomendada?'},
 {id:'usage',question:'¿Cómo y a qué hora se toma?'},
 {id:'with_food',question:'¿Debe consumirse con alimentos?'},
 {id:'long_term',question:'¿Durante cuánto tiempo se puede tomar?'},
 {id:'missed',question:'¿Qué pasa si olvido una toma?'},
 {id:'side_effects',question:'¿Qué efectos secundarios puede causar?'},
 {id:'avoid',question:'¿Quiénes deben evitarlo?'},
 {id:'interactions',question:'¿Puede interactuar con medicamentos u otros suplementos?'},
 {id:'vulnerable',question:'¿Pueden consumirlo niños, embarazadas o personas en lactancia?'},
 {id:'condition',question:'¿Puedo tomarlo si tengo alguna enfermedad?'},
 {id:'allergens',question:'¿Contiene azúcar, gluten, lactosa u otros alérgenos?'},
 {id:'manufacturer',question:'¿Quién lo fabrica y dónde?'},
 {id:'quality',question:'¿Cómo se verifica su calidad y el contenido de sus ingredientes?'},
 {id:'sanitary',question:'¿Qué información sanitaria y de etiquetado tiene?'},
 {id:'price_duration',question:'¿Cuánto cuesta y cuántos días dura un envase?'},
 {id:'purchase',question:'¿Dónde puedo comprarlo y cómo identifico que sea original?'},
 {id:'expiry',question:'¿Cuál es su fecha de caducidad y cómo debe almacenarse?'},
] as const;
export type ProductQuestionId=typeof productQuestions[number]['id'];
export type CoverageStatus='available'|'partial'|'missing'|'conflict'|'not_applicable';
export type ProductQuestionAnswer={message:string;status:CoverageStatus;gaps:string[];kind:'catalog'|'precaution'};
const normalized=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const words=(s:string)=>normalized(s).match(/[a-z0-9]+/g)??[];
const familiarWords='para que sirve que beneficios tiene que contiene como se toma que riesgos tiene cuanto cuesta precio costo riesgos preparacion ingredientes dosis cantidad cantidades capsulas toma tomar uso seguridad precauciones contraindicaciones se puede usar consumir preparar componente componentes formula composicion con sin en cuanto tiempo dura cuales son sus quien fabrica de donde viene fabricante pais origen dias semanas envase porcion sirve estudio evidencia cientifica ensayos clinicos efecto secundario alergeno alergia embarazo ninos lactantes diferencias comparacion calidad certificaciones registro sanitario etiquetado comprar original autentico autenticidad conservar almacenamiento caduca caducidad vencimiento resultados reales esperar expectativas producto este esta su un una y el la los las al del me mi saber quiero dime favor'.split(' ');
const allowedWords=new Set([...productQuestions.flatMap(q=>words(normalizeQuestion(q.question,[]))),...familiarWords]);
export function detectProductQuestion(question:string,products:Product[]):ProductQuestionId|undefined{
 const text=normalizeQuestion(question,products.map(p=>p.family+' '+p.presentation));
 const nameWords=new Set(products.flatMap(p=>words(p.family+' '+p.presentation+' '+(productAliases[p.family]??[]).join(' '))));
 // A new ingredient, competitor, disease or other qualifier must not be silently discarded.
 if(words(text).some(word=>!allowedWords.has(word)&&!nameWords.has(word)))return;
 // Mixed personal safety conditions stay with the existing full precaution policy.
 if(/embaraz|lactan|ninos/.test(text)&&/alerg|intoleran|medicamento/.test(text))return;
 if(/caduc|almacen|conserv|vencim/.test(text))return 'expiry';
 if(/compr|original|autenti/.test(text))return 'purchase';
 if(/cuesta|precio|costo|dias.*dura|dura.*envase/.test(text))return 'price_duration';
 if(/sanitari|etiquetado|registro/.test(text))return 'sanitary';
 if(/calidad|certifica|verifica/.test(text))return 'quality';
 if(/fabrica|fabricante|pais|origen|donde viene/.test(text))return 'manufacturer';
 if(/interac|combinar|medicamentos\b|suplementos\b/.test(text)||/medicamento/.test(text)&&!/\b(?:es|tipo|clasificacion)\b.*medicamento/.test(text))return 'interactions';
 if(/azucar|gluten|lactosa|alerg|intoleran/.test(text))return 'allergens';
 if(/ninos|embaraz|lactan|infantil/.test(text))return 'vulnerable';
 if(/enfermedad|condicion medica/.test(text))return 'condition';
 if(/secundari/.test(text))return 'side_effects';
 if(/evitar|contraindic|riesgo|precaucion|seguridad/.test(text))return 'avoid';
 if(/olvid|olvido/.test(text))return 'missed';
 if(/durante.*tiempo|cuanto tiempo.*(?:tomar|consum|usar)/.test(text))return 'long_term';
 if(/alimentos|comidas|ayunas/.test(text))return 'with_food';
 if(/estudi|cientific|evidenci|ensayo/.test(text))return 'studies';
 if(/variar|varian/.test(text))return 'variation';
 if(/notar|resultados.*tiempo|cuanto tiempo.*resultado/.test(text))return 'results_time';
 if(/esperar|expectativa/.test(text))return 'expectations';
 if(/diferencia|comparacion|similares/.test(text))return 'comparison';
 if(/suplemento|medicamento/.test(text))return 'classification';
 if(/ingredien|composicion|component|formula/.test(text))return 'ingredients';
 if(/porcion|dosis|cantidad/.test(text))return 'portion';
 if(/preparacion|como.*(?:toma|tomar|consum|usa)|hora/.test(text))return 'usage';
 if(/benefici/.test(text))return 'benefits';
 if(/para que sirve|que es/.test(text))return 'purpose';
}
function plain(text:string){return text.replace(/^Según (?:el catálogo|la ficha técnica):\s*/i,'').replace(/La ficha(?: técnica)? (?:recomienda|indica|señala|describe|lo presenta como) /gi,'').replace(/, según la ficha\./gi,'.').replace(/La ficha no recomienda/gi,'No se recomienda').replace(/La ficha pide consultar/gi,'Consulta').replace(/La etiqueta fotografiada menciona /gi,'La fórmula indicada incluye ').trim()}
export function productQuestionAnswer(p:Product,id:ProductQuestionId):ProductQuestionAnswer{
 const profile=knowledgeByFamily[p.family];const topical=profile.classification==='topical';
 const conflict=p.pending.some(t=>/difier|conflict/.test(t));const warnings=p.warnings.map(plain);const warningText=warnings.join(' ');
 const answer=(message:string,status:CoverageStatus='available',gaps:string[]=[],kind:'catalog'|'precaution'='catalog'):ProductQuestionAnswer=>({message,status,gaps,kind});
 const missing=(message:string,gap:string)=>answer(message,'missing',[gap]);
 switch(id){
  case 'purpose':{
   // Reuse the reviewed benefits; a purpose answer must explain their role, not stop at the ingredient list.
   const benefits=p.benefits??[];
   const detail=benefits.length?`\n\n${profile.benefitsReview==='nutritional'?'En concreto:':profile.benefitsReview==='cosmetic'?'En el cuidado de la piel, ofrece:':'Su enfoque es:'}\n${benefits.map(b=>'• '+b).join('\n')}`:'';
   return answer(profile.purpose+detail,profile.classification==='unconfirmed'||profile.benefitsReview==='described'?'partial':'available',profile.classification==='unconfirmed'?['Composición, concentración y clasificación de Hemp-C']:profile.benefitsReview==='described'?['Eficacia clínica de los beneficios descritos']:[]);
  }
  case 'benefits':return p.benefits?.length?answer(`${p.family} tiene este enfoque${profile.benefitsReview==='nutritional'?' nutricional':''}:\n\n${p.benefits.map(b=>'• '+b).join('\n')}`,profile.benefitsReview==='described'?'partial':'available',profile.benefitsReview==='described'?['Eficacia clínica de los beneficios descritos']:[]):missing(`No tengo beneficios confirmados para ${p.family}. Faltan su composición, concentración y evidencia del producto.`,'Beneficios verificables');
  case 'ingredients':return answer(p.ingredients?`${p.name}. Ingredientes: ${plain(p.ingredients)}\n\nNo tengo confirmadas las cantidades de cada ingrediente por porción.`:`No tengo la composición completa ni las cantidades de ingredientes de ${p.name}.`,'partial',p.ingredients?['Cantidades de ingredientes por porción',...(['espresso','macchiato'].includes(p.id)?['Lista completa y especies de hongos']:[])]:['Composición completa','Cantidades por ingrediente']);
  case 'comparison':return answer(`De ${p.name} puedo comparar su ${p.presentation.toLowerCase()} y su fórmula: ${p.features.slice(0,2).map(plain).join('; ')}. No tengo una comparación clínica que demuestre que sea mejor que otro producto. ¿Con cuál quieres compararlo?`,'partial',['Comparación independiente con el producto elegido']);
  case 'classification':return profile.classification==='unconfirmed'?missing(`No tengo confirmada la clasificación sanitaria de ${p.family}. No puedo presentarlo como suplemento ni como medicamento sin revisar su etiqueta.`,'Clasificación sanitaria'):answer(topical?'Re-New Pro es un gel de uso tópico para el cuidado de la piel. No es un producto para consumir; no tengo confirmado un registro como medicamento.':`${p.family} se presenta como un suplemento o complemento alimenticio. No tengo acreditado un registro como medicamento.`,'partial',['Acreditación de clasificación sanitaria y etiquetado']);
  case 'studies':return missing(`No tengo estudios de ${p.family} con autores, publicación y referencias suficientes para verificarlos. Las afirmaciones o porcentajes promocionales no permiten confirmar por sí solos su eficacia.`,'Referencias científicas verificables del producto');
  case 'results_time':return missing(`No tengo un plazo de resultados verificado para ${p.family}. No puedo prometer que notarás un efecto en un número concreto de días o semanas.`,'Plazo de resultados validado');
  case 'variation':return answer('No puedo garantizar el mismo resultado para todas las personas. No tengo datos verificados para predecir cómo responderá una persona concreta.','partial',['Datos de variación y respuesta individual']);
  case 'expectations':return answer(`${profile.purpose}\n\nNo tengo verificados resultados clínicos ni un efecto terapéutico que pueda prometerte.`,'partial',['Resultados clínicos verificables']);
  case 'portion':if(conflict)return answer(`La porción de ${p.family} está por confirmar: el catálogo y la ficha técnica indican cantidades distintas. No hay una pauta unificada que pueda darte sin resolver esa diferencia.`,'conflict',['Resolver porción entre catálogo y ficha']);return profile.portion?answer(profile.portion,/confirmar|exacta/.test(profile.portion)?'partial':'available',/confirmar|exacta/.test(profile.portion)?['Medida exacta por preparación']:[]):missing(`No tengo una porción diaria confirmada de ${p.family}. ${p.id==='hemp-c'?'Falta la concentración del líquido.':'Faltan la cantidad exacta por porción y la frecuencia diaria.'}`,'Porción diaria y medida exacta');
  case 'usage':if(conflict)return answer(`${p.preparation??'La cantidad y frecuencia indicadas difieren entre documentos.'} La porción está por confirmar antes de establecer una pauta.`,'conflict',['Unificar cantidad y frecuencia de uso']);return p.usage?answer(plain(p.usage),['espresso','macchiato'].includes(p.id)?'partial':'available',['espresso','macchiato'].includes(p.id)?['Cantidad de polvo, agua y frecuencia diaria']:[]):answer(`${p.preparation??'No tengo una pauta de uso confirmada.'} No puedo establecer una hora ni una porción hasta completar esos datos.`,'missing',['Pauta completa de uso']);
  case 'with_food':if(topical)return answer('No aplica: Re-New Pro se aplica sobre la piel y no se toma con alimentos.','not_applicable');return profile.withFood?answer(profile.withFood,conflict?'conflict':'available',conflict?['Porción y frecuencia en conflicto']:[]):missing(`No tengo confirmado si ${p.family} debe consumirse con alimentos ni si se recomienda tomarlo en ayunas.`,'Relación con alimentos');
  case 'long_term':return missing(`No tengo una duración máxima de uso ni una pauta de descanso confirmadas para ${p.family}. ${topical?'La frecuencia de aplicación no establece durante cuántos meses usarlo.':'La frecuencia diaria no establece durante cuánto tiempo es adecuado consumirlo.'}`,'Duración de uso y descansos');
  case 'missed':return missing(`No tengo una pauta confirmada para una ${topical?'aplicación':'toma'} olvidada de ${p.family}. Revisa las instrucciones de la etiqueta antes de cambiar la cantidad o el horario.`,'Pauta ante omisión');
  case 'side_effects':return missing(`No tengo una lista verificada de efectos secundarios ni su frecuencia para ${p.family}. Que una fórmula sea natural no permite afirmar que carezca de efectos adversos.`,'Efectos adversos y frecuencia');
  case 'avoid':return warningText?answer(warningText+' No tengo una lista exhaustiva de contraindicaciones.','partial',['Contraindicaciones completas'],'precaution'):answer(`No tengo contraindicaciones específicas verificadas de ${p.family}. Esa ausencia de datos no confirma que sea adecuado para todas las personas.`,'missing',['Contraindicaciones'],'precaution');
  case 'interactions':return answer(`No tengo una evaluación confirmada de interacciones de ${p.family} con medicamentos u otros suplementos. No puedo asegurar que una combinación sea compatible; revísala con un médico o farmacéutico antes de combinar productos.`,'missing',['Interacciones verificadas'],'precaution');
  case 'vulnerable':{
   const relevant=warnings.filter(w=>/adult|niñ|infantil|pediatra|embaraz|lactan/i.test(w));const gaps=[];
   if(!relevant.some(w=>/adult|niñ|infantil|pediatra/i.test(w)))gaps.push('Uso en niños');if(!relevant.some(w=>/embaraz|lactan/i.test(w)))gaps.push('Uso en embarazo y lactancia');
   return answer((topical?'Es de uso tópico. ':'')+(relevant.join(' ')||`No tengo una pauta confirmada de ${p.family} para niños, embarazo o lactancia.`)+(gaps.length&&relevant.length?' Falta confirmar '+gaps.join(' y ').toLowerCase()+'.':''),gaps.length?'partial':'available',gaps,'precaution');
  }
  case 'condition':return answer(`No puedo confirmar que ${p.family} sea adecuado para alguien con una enfermedad sin una valoración individual. ${warnings.filter(w=>/crónic|condicion|tratamiento/i.test(w)).join(' ')} La valoración debe considerar la enfermedad, los medicamentos y la etiqueta completa.`,'partial',['Valoración individual para la condición y tratamiento'],'precaution');
  case 'allergens':{
   const known=warnings.filter(w=>/leche|huevo|soya|lactosa/i.test(w));return answer((known.join(' ')||`No tengo una declaración completa de alérgenos de ${p.family}.`)+` No tengo confirmadas las cantidades de azúcar ni una declaración verificada de ausencia de gluten${known.some(w=>/lactosa/i.test(w))?'':' o lactosa'}. La ausencia de un ingrediente en el resumen no significa que el producto esté libre de él.`,'partial',['Azúcares por porción','Declaración completa de alérgenos y trazas'],'precaution');
  }
  case 'manufacturer':return answer(`Marca: HC Wellness. ${p.origin?`La identificación disponible es HC Wellness LLC, con fabricación en ${p.origin}.`:'No tengo confirmados el fabricante legal ni el país de fabricación.'} No tengo verificada la planta de fabricación.`,'partial',p.origin?['Planta de fabricación verificada']:['Fabricante legal','País y planta de fabricación']);
  case 'quality':return missing(`No tengo certificados de análisis por lote, pruebas independientes ni controles de calidad verificables de ${p.family}. No puedo confirmar la cantidad real de cada ingrediente solo a partir de una descripción comercial.`,'Certificados de análisis y pruebas por lote');
  case 'sanitary':return missing(`No tengo documentación sanitaria ni etiquetado completo verificados de ${p.family}. Faltan los datos del responsable, lote, advertencias y documentación aplicable que permitan comprobarlo; una imagen del envase no acredita una autorización sanitaria.`,'Expediente sanitario y etiqueta completa');
  case 'price_duration':return answer(`No tengo un precio vigente confirmado de ${p.family}. ${p.package?'Contenido registrado: '+p.package+'.':'El contenido neto de esta presentación está por confirmar.'} ${profile.packDays?`Con la porción diaria indicada, el envase rinde aproximadamente ${profile.packDays} días.`:'No tengo una duración en días confirmada: depende de la porción y frecuencia, que deben estar definidas.'}`,'partial',['Precio vigente',...(!profile.packDays?['Duración en días']:[])]);
  case 'purchase':return missing(`No tengo un enlace de compra ni un método oficial de autenticación confirmado de ${p.family}. Para comprobar originalidad faltan un canal autorizado y un procedimiento verificable del fabricante para el lote.`,'Canal autorizado y autenticación del lote');
  case 'expiry':return missing(`No tengo la fecha de caducidad de tu envase ni las condiciones específicas de almacenamiento de ${p.family}. La caducidad debe comprobarse en la etiqueta del lote; no puedo calcularla a partir del nombre del producto.`,'Caducidad por lote y almacenamiento');
 }
}
