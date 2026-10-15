import type {Product} from './portal-content';

export function productHref(basePath:string,id:string,query='',page=1) {
  const params=new URLSearchParams();
  if(query.trim())params.set('q',query.trim());
  if(page>1)params.set('pagina',String(page));
  return `${basePath}/productos/${encodeURIComponent(id)}${params.size?'?'+params.toString():''}`;
}

const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function productFamilies(products:readonly Product[],query:string) {
  const groups=new Map<string,Product[]>();
  for(const product of products)groups.set(product.family,[...(groups.get(product.family)??[]),product]);
  const value=normalize(query.slice(0,120));
  return [...groups.values()].flatMap(variants=>{
    const product=variants.find(p=>normalize(`${p.name} ${p.category} ${p.presentation}`).includes(value));
    return product?[{product,variants}]:[];
  });
}
