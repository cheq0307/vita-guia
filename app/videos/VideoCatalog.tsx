'use client';
import {ExternalLink,PlayCircle,Link2} from 'lucide-react';
import {useState} from 'react';
import {videoFileHref,videoHref,type VideoItem,type VideoPage,type VideoFilter} from './policy';
export default function VideoCatalog({basePath,query,filter,catalog,canManage}:{basePath:string;query:string;filter:VideoFilter;catalog:VideoPage;canManage:boolean}){
 return <>
  <div className="video-filter-bar"><nav className="video-filters" aria-label="Tipo de contenido">{([['all','Todos'],['file','Videos'],['link','Enlaces']] as const).map(([id,label])=><a key={id} href={videoHref(basePath,query,1,id)} aria-current={filter===id?'page':undefined}>{label}</a>)}</nav>{canManage&&<a className="document-secondary" href="/admin/videos">Administrar videos y enlaces</a>}</div>
  <div className="catalog-summary"><p role="status">{catalog.total} {catalog.total===1?'resultado':'resultados'}{query?` para “${query}”`:''}</p>{query&&<a href={videoHref(basePath,'',1,filter)}>Limpiar búsqueda</a>}</div>
  {catalog.total===0?<div className="catalog-empty video-empty"><PlayCircle size={36} aria-hidden="true"/><h2>{query?'No encontramos coincidencias':'Pronto habrá más para aprender'}</h2><p>{query?'Prueba con otra palabra o consulta todos los contenidos.':'Aquí encontrarás videos y enlaces seleccionados para la comunidad.'}</p>{query?<a href={videoHref(basePath)}>Ver todo</a>:canManage?<a className="primary-button" href="/admin/videos">Agregar contenido</a>:null}</div>:<div className="video-catalog-grid">{catalog.items.map(video=><VideoCard key={video.id} video={video} basePath={basePath}/>)}</div>}
  {catalog.pages>1&&<nav className="catalog-pagination" aria-label="Páginas de videos">{catalog.page>1?<a href={videoHref(basePath,query,catalog.page-1,filter)}>← Anterior</a>:<span aria-disabled="true">← Anterior</span>}<span>Página {catalog.page} de {catalog.pages}</span>{catalog.page<catalog.pages?<a href={videoHref(basePath,query,catalog.page+1,filter)}>Siguiente →</a>:<span aria-disabled="true">Siguiente →</span>}</nav>}
 </>;
}
function VideoCard({video,basePath}:{video:VideoItem;basePath:string}){
 const [playing,setPlaying]=useState(false);const [error,setError]=useState(false);
 return <article className="video-catalog-card">
  {video.kind==='file'?<div className="video-player-wrap">{playing?<video controls autoPlay playsInline preload="metadata" src={videoFileHref(basePath,video.id)} aria-label={video.title} onError={()=>setError(true)}/>:<button type="button" className="video-play-cover" onClick={()=>setPlaying(true)} aria-label={'Reproducir '+video.title}><PlayCircle size={48} aria-hidden="true"/><span>Reproducir video</span></button>}</div>:<a className="video-link-cover" href={video.url!} target="_blank" rel="noopener noreferrer" aria-label={'Abrir '+video.title+' en otra pestaña'}><Link2 size={36} aria-hidden="true"/><span>{new URL(video.url!).hostname.replace(/^www\./,'')}</span><ExternalLink size={18} aria-hidden="true"/></a>}
  <div className="video-card-copy"><span className="video-kind">{video.kind==='file'?'Video':'Enlace externo'}</span><h2>{video.title}</h2><p>{video.description}</p>{error&&<p className="form-error" role="alert">No se pudo reproducir. Actualiza la página o consulta con tu asesor.</p>}{video.kind==='link'&&<a className="video-card-action" href={video.url!} target="_blank" rel="noopener noreferrer">Ver video <ExternalLink size={15} aria-hidden="true"/><span className="sr-only"> en otra pestaña</span></a>}</div>
 </article>;
}
