export type VideoKind='file'|'link';
export type VideoFilter='all'|VideoKind;
export type VideoStatus='draft'|'published'|'archived';
export type VideoItem={id:string;title:string;description:string;kind:VideoKind;url:string|null;status:VideoStatus;file_id:string|null;file_state:string|null;size:number|null;mime:string|null;created_at:string};
export type VideoPage={items:VideoItem[];total:number;pages:number;page:number};
export function externalVideoUrl(value:unknown):string|null{
 if(typeof value!=='string'||value.length>2000)return null;
 try{const url=new URL(value.trim());const host=url.hostname.toLowerCase();
  if(url.protocol!=='https:'||url.username||url.password||!host.includes('.')||host.endsWith('.localhost')||host.endsWith('.local')||host==='localhost'||/^\d+\.\d+\.\d+\.\d+$/.test(host)||host.includes(':'))return null;
  return url.href;
 }catch{return null}
}
export function videoMime(filename:string):string|null{return /\.mp4$/i.test(filename)?'video/mp4':/\.webm$/i.test(filename)?'video/webm':null}
export function videoFilter(value:unknown):VideoFilter{return value==='file'||value==='link'?value:'all'}
export function videoHref(base:string,query='',page=1,filter:VideoFilter='all'){
 const params=new URLSearchParams();if(query)params.set('q',query);if(page>1)params.set('pagina',String(page));if(filter!=='all')params.set('tipo',filter);
 return base+'/videos'+(params.size?'?'+params.toString():'');
}
export function videoFileHref(base:string,id:string){
 if(base.startsWith('/guia/'))return base+'/videos/archivo/'+encodeURIComponent(id);
 const advisor=/^\/asesor\/([^/]+)/.exec(base);
 return '/api/videos/files/'+encodeURIComponent(id)+(advisor?'?advisor='+advisor[1]:'');
}
