import type {AssistantAnswer} from './types';
const clean=(text:string)=>text.replace(/(\p{L})-\s+(\p{L})/gu,'$1$2').replace(/\s+/g,' ').replace(/^…|…$/g,'').trim();
const normalized=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function conversational(text:string){
 return clean(text)
  .replace(/\s*Fuente:[\s\S]*?(?=Consulta la etiqueta vigente|$)/i,' ')
  .replace(/Ingredientes según el material recibido:/gi,'Ingredientes:')
  .replace(/Según (?:el catálogo|la ficha técnica|el material recibido)\s*:?\s*/gi,'')
  .replace(/La ficha(?: técnica)? menciona tomar ([^.]+)\./gi,'$1 se toma preferentemente.').replace(/ (preferentemente[^.]+) se toma preferentemente\./gi,' se toma $1.')
  .replace(/La ficha(?: técnica)? también permite/gi,'También puedes usar')
  .replace(/La ficha(?: técnica)? (?:también )?(?:menciona|indica|señala|describe) /gi,'')
  .replace(/La ficha no recomienda su consumo/gi,'No se recomienda su consumo')
  .replace(/La ficha lo presenta como complemento de/gi,'Es un complemento de')
  .replace(/La ficha pide consultar con un pediatra antes de administrarlo/gi,'Consulta con un pediatra antes de dárselo a un niño')
  .replace(/El material recibido no especifica si /gi,'No tengo confirmado si ')
  .replace(/Esta guía no determina si es adecuado para ti; /gi,'Para saber si es adecuado para ti, ')
  .replace(/\s+/g,' ').trim().replace(/^\p{Ll}/u,c=>c.toUpperCase());
}
export function naturalAnswer(answer:AssistantAnswer,question:string,family:string|undefined,terms:string[]):AssistantAnswer{
 let message=conversational(answer.message);
 if(answer.kind==='precaution')message=message.replace(/^[^.]+\. Precauciones indicadas:\s*/,'');
 if(answer.kind==='missing')message='No tengo ese dato confirmado. Puedes consultarlo con tu asesor.';
 if(answer.kind==='documents'&&answer.sources.length){
  const passages=answer.sources.map(source=>clean(source.excerpt));const first=passages[0];
  const term=terms.length===1?terms[0]:undefined;
  if(term&&/(?:contien|incluy|lleva|tiene)/i.test(normalized(question))){
   const negated=new RegExp('(?:no contiene|libre de|sin)\\b[^.]*\\b'+term+'\\b','i');
   const negative=passages.find(p=>negated.test(normalized(p)));
   const affirmative=passages.find(p=>/(?:ingredientes|composicion|complejo[^:]*:|contiene|incluye)/i.test(normalized(p))&&!negated.test(normalized(p)));
   if(negative&&affirmative)message='No tengo confirmado ese ingrediente: la información disponible no coincide.';
   else if(negative)message=conversational(negative);
   else if(affirmative){
    const item=affirmative.split(/[,;:]|\s+y\s+/i).find(part=>normalized(part).includes(term))?.replace(/^(?:contiene|incluye)\s+/i,'').replace(/[.]+$/,'').trim();
    message=item?`Sí, ${family??'este producto'} contiene ${item.charAt(0).toLowerCase()+item.slice(1)}.`:conversational(first);
   }else message=conversational(first);
  }else if(/^(?:Complejo[^:]*|Ingredientes|Composición):/i.test(first))message='Entre sus ingredientes están '+first.slice(first.indexOf(':')+1).trim();
  else message=conversational(first.replace(/^(?:Modo de uso|Preparación|Indicaciones de uso)\s*:\s*/i,''));
 }
 return {...answer,message};
}
