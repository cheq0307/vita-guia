export const portalSections = ['inicio','productos','videos','historias'] as const;
export type PortalSection = typeof portalSections[number];
export function isPortalSection(value:string):value is PortalSection { return (portalSections as readonly string[]).includes(value); }
export function catalogSearch(search:{q?:unknown;pagina?:unknown}) {
  const requested=typeof search.pagina==='string'?Number(search.pagina):1;
  return {query:typeof search.q==='string'?search.q.trim().slice(0,120):'',page:Number.isFinite(requested)&&requested>0?Math.floor(requested):1};
}
export function portalHref(basePath:string, section:PortalSection, query='', page=1) {
  const params=new URLSearchParams();
  if(query.trim()) params.set('q',query.trim());
  if(page>1) params.set('pagina',String(page));
  return `${basePath}/${section}${params.size?'?'+params.toString():''}`;
}
function normalize(value:string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim(); }
export function catalogPage<T>(items:readonly T[], query:string, requestedPage:number, text:(item:T)=>string) {
  const normalized=normalize(query.slice(0,120));
  const filtered=normalized?items.filter(item=>normalize(text(item)).includes(normalized)):[...items];
  const pages=Math.max(1,Math.ceil(filtered.length/9));
  const page=Math.min(pages,Math.max(1,Number.isFinite(requestedPage)?Math.floor(requestedPage):1));
  return {items:filtered.slice((page-1)*9,page*9),total:filtered.length,pages,page};
}
