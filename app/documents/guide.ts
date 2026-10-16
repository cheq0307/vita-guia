import {documentsApi} from './api';
// Keep requests inside the token-scoped visit cookie; never broaden its path.
export function guideDocuments(request:Request,token:string,path:string[]=[]){
 if(path.length&&!(path.length===2&&path[0]==='files'))return Response.json({error:'Ruta no encontrada.'},{status:404});
 const url=new URL(request.url);url.searchParams.set('guide',token);url.searchParams.delete('advisor');
 return documentsApi(new Request(url,{method:'GET',headers:request.headers}),path);
}
