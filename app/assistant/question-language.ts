const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const productAliases:Record<string,string[]>={'Complex Green Leaves':['Complex Green','Green Leaves','Green'],'Complex Mocha':['Mocha'],'Re-New Pro':['Re-New','Renew'],'AHCC+':['AHCC Plus'],'Support+':['Support Plus'],'NAD Shield+':['NAD Shield Plus'],'Connect Plus':['Connect']};
function oneEdit(a:string,b:string){
 if(a===b)return true;
 if(Math.abs(a.length-b.length)>1)return false;
 if(a.length===b.length){const changes=[...a].flatMap((c,i)=>c!==b[i]?[i]:[]);return changes.length===1||changes.length===2&&changes[1]===changes[0]+1&&a[changes[0]]===b[changes[1]]&&a[changes[1]]===b[changes[0]]}
 const longer=a.length>b.length?a:b;const shorter=a.length>b.length?b:a;
 return [...longer].some((_,i)=>longer.slice(0,i)+longer.slice(i+1)===shorter);
}
export function normalizeQuestion(question:string,names:string[]){
 const corrections:Record<string,string>={q:'que',k:'que',pa:'para',sirbe:'sirve',sirven:'sirve',benificios:'beneficios',benefisios:'beneficios',ingredintes:'ingredientes',ingedientes:'ingredientes',prepararacion:'preparacion'};
 const vocabulary=[...new Set(names.flatMap(name=>normalize(name).match(/[a-z0-9]+/g)??[]))].filter(word=>word.length>=5);
 let text=normalize(question).replace(/[a-z0-9]+/g,word=>{
  if(corrections[word])return corrections[word];if(vocabulary.includes(word))return word;
  const matches=vocabulary.filter(name=>oneEdit(word,name));return matches.length===1?matches[0]:word;
 });
 text=text.replace(/\b(?:me puedes decir|puedes decirme|me dices|me podrias decir|por favor|porfa)\b/g,' ')
  .replace(/\b(?:de que esta hecho|que lleva|que contiene|cuales son sus componentes)\b/g,'ingredientes')
  .replace(/\b(?:como (?:lo |la |se )?(?:tomo|toma|consumo|consume|uso|usa|preparo|prepara)|como puedo (?:tomarlo|prepararlo|usarlo))\b/g,'preparacion')
  .replace(/\b(?:con el estomago vacio|en estomago vacio|antes de desayunar|antes del desayuno)\b/g,'en ayunas')
  .replace(/\s+/g,' ').trim();
 return text;
}
