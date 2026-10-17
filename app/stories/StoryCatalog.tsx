'use client';
import {ExternalLink,MessageCircle} from 'lucide-react';
import {portalHref} from '../portal-navigation';
import {storyMediaHref,type StoryPage,type StoryMedia} from './policy';
export default function StoryCatalog({catalog,basePath,query,canManage}:{catalog:StoryPage;basePath:string;query:string;canManage:boolean}){
 return <>
 <div className="story-catalog-toolbar"><p>Experiencias personales con los productos. Cada persona puede vivir resultados distintos.</p>{canManage&&<a className="document-secondary" href="/admin/historias">Administrar historias</a>}</div>
 <div className="catalog-summary"><p role="status">{catalog.total} {catalog.total===1?'historia':'historias'}{query?` para “${query}”`:''}</p>{query&&<a href={portalHref(basePath,'historias')}>Limpiar búsqueda</a>}</div>
 {catalog.total===0?<div className="catalog-empty"><MessageCircle size={36} aria-hidden="true"/><h2>{query?'No encontramos coincidencias':'Las experiencias también se comparten'}</h2><p>{query?'Prueba con el nombre de un producto u otra palabra.':'Aquí podrás conocer cómo otras personas han integrado los productos a su vida.'}</p>{canManage&&<a className="primary-button" href="/admin/historias">Agregar una historia</a>}</div>:<div className="success-story-grid">{catalog.items.map(story=><article className="success-story-card" key={story.id}>
  <header><span className="story-avatar" aria-hidden="true">{story.author.slice(0,1).toUpperCase()}</span><div><span className="story-author">{story.author}</span>{story.period&&<span className="story-period">{story.period}</span>}</div></header>
  <h2>{story.title}</h2>{story.products.length>0&&<div className="story-product-tags">{story.products.map(name=><span key={name}>{name}</span>)}</div>}
  {story.body&&(story.body.length>550?<><p className="story-body">{story.body.slice(0,350)}…</p><details className="story-full-text"><summary>Leer historia completa</summary><p className="story-body">{story.body}</p></details></>:<p className="story-body">{story.body}</p>)}
  {story.media.length>0&&<div className="story-media-grid">{story.media.map(media=><StoryAttachment key={media.id} media={media} basePath={basePath}/>)}</div>}
 </article>)}</div>}
 {catalog.pages>1&&<nav className="catalog-pagination" aria-label="Páginas de historias">{catalog.page>1?<a href={portalHref(basePath,'historias',query,catalog.page-1)}>← Anterior</a>:<span aria-disabled="true">← Anterior</span>}<span>Página {catalog.page} de {catalog.pages}</span>{catalog.page<catalog.pages?<a href={portalHref(basePath,'historias',query,catalog.page+1)}>Siguiente →</a>:<span aria-disabled="true">Siguiente →</span>}</nav>}
 </>;
}
function StoryAttachment({media,basePath}:{media:StoryMedia;basePath:string}){
 const src=storyMediaHref(basePath,media.story_id,media.id);
 return <figure>{media.kind==='image'?<a href={src} target="_blank" rel="noopener noreferrer" aria-label="Ampliar imagen de la historia"><img src={src} alt={media.caption||'Imagen de la experiencia'} loading="lazy" width={640} height={480}/></a>:media.kind==='video'?<video src={src} controls playsInline preload="none" aria-label={media.caption||'Video de la experiencia'}/>:<a className="story-external-video" href={media.url!} target="_blank" rel="noopener noreferrer"><span>Ver experiencia en video</span><small>{new URL(media.url!).hostname.replace(/^www\./,'')}</small><ExternalLink size={18} aria-hidden="true"/><span className="sr-only">Se abre en otra pestaña</span></a>}{media.caption&&<figcaption>{media.caption}</figcaption>}</figure>;
}
