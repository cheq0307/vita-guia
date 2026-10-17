export type WorkspaceItem={label:string;href:string;icon:'home'|'links'|'review'|'content'|'more'|'files'|'page'};
export function workspaceBase(advisorToken?:string){return advisorToken?'/asesor/'+encodeURIComponent(advisorToken):'/admin'}
export function workspaceNavigation(advisorToken?:string):WorkspaceItem[]{
 const base=workspaceBase(advisorToken);
 return advisorToken?[
  {label:'Enlaces',href:base+'/enlaces',icon:'links'},
  {label:'Página',href:base+'/biblioteca',icon:'page'},
  {label:'Aportar',href:base+'/aportaciones',icon:'review'},
  {label:'Documentos',href:base+'/documentos',icon:'files'},
  {label:'Más',href:base+'/mas',icon:'more'},
 ]:[
  {label:'Panel',href:base,icon:'home'},
  {label:'Enlaces',href:base+'/enlaces',icon:'links'},
  {label:'Revisiones',href:base+'/aportaciones',icon:'review'},
  {label:'Contenido',href:base+'/contenido',icon:'content'},
  {label:'Más',href:base+'/mas',icon:'more'},
 ];
}
