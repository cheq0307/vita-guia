"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Package, PlayCircle, MessageCircle, Search } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { products, videos, stories, answerQuestion } from "./portal-content";
import { catalogPage, portalHref, type PortalSection } from "./portal-navigation";

type ClientPortalProps={basePath:string;section?:PortalSection;query?:string;page?:number;recipientName?:string;expiresAt?:string;workspaceLink?:{href:string;label:string};showAdminLogout?:boolean};
const labels:Record<PortalSection,string>={inicio:'Inicio',productos:'Productos',videos:'Videos',historias:'Historias'};
const introductions={productos:['HC Wellness','Catálogo de productos','Encuentra cada producto y consulta sus indicaciones en un solo lugar.'],videos:['Paso a paso','Aprende a tu ritmo','Busca una explicación y vuelve a ella cuando la necesites.'],historias:['Experiencias','Historias que acompañan','Explora las historias de esta biblioteca.']} as const;

export function ClientPortal({basePath,section='inicio',query='',page=1,recipientName='',expiresAt,workspaceLink,showAdminLogout=false}:ClientPortalProps) {
  const [chatOpen,setChatOpen]=useState(false);
  const [question,setQuestion]=useState('');
  const [messages,setMessages]=useState<string[]>([]);
  const expiryLabel=expiresAt?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long'}).format(new Date(expiresAt)):'';
  const productPage=catalogPage(products,query,page,p=>p.name+' '+p.category);
  const videoPage=catalogPage(videos,query,page,v=>v.title+' '+v.description);
  const storyPage=catalogPage(stories,query,page,s=>s.name+' '+s.quote);
  const catalog=section==='productos'?productPage:section==='videos'?videoPage:storyPage;
  function ask(value:string){const clean=value.trim();if(!clean)return;setMessages(current=>[...current,clean,answerQuestion(clean)]);setQuestion('');}

  return <main className="portal-shell">
    <header className="topbar">
      <a className="brand" href={portalHref(basePath,'inicio')} aria-label="Vita Guía inicio"><span className="brand-mark">V</span><span>Vita Guía</span></a>
      <div className={showAdminLogout?'topbar-actions admin-preview-actions':'topbar-actions'}>
        {workspaceLink&&<a className="workspace-link workspace-link-outline" href={workspaceLink.href}><ArrowLeft size={18} aria-hidden="true"/>{workspaceLink.label}</a>}
        {showAdminLogout&&<LogoutButton/>}
      </div>
    </header>
    <nav className="section-nav" aria-label="Secciones principales">
      {(Object.keys(labels) as PortalSection[]).map(id=><a key={id} href={portalHref(basePath,id)} className={section===id?'active':''} aria-current={section===id?'page':undefined}>{labels[id]}</a>)}
    </nav>

    {section==='inicio'?<>
      <section className="welcome-band">
        <div><p className="eyebrow">{recipientName?`Hola, ${recipientName}`:'Tu guía personal'}</p><h1>Todo lo que necesitas para comenzar con confianza.</h1><p className="intro">Elige qué quieres consultar. Tu biblioteca, a tu ritmo.</p></div>
        <div className="access-note"><span>{workspaceLink?'Vista previa':'Enlace activo'}</span><strong>{workspaceLink?'Así verán la página tus clientes':`Disponible hasta el ${expiryLabel}`}</strong><small>{workspaceLink?'La vigencia depende del enlace que compartas':'Puedes volver mientras el enlace siga activo'}</small></div>
      </section>
      <section className="content-wrap portal-overview" aria-labelledby="overview-heading">
        <div className="section-heading"><div><p className="eyebrow">Tu biblioteca</p><h2 id="overview-heading">¿Por dónde empezamos?</h2></div></div>
        <div className="portal-category-grid">
          <a className="portal-category-card" href={portalHref(basePath,'productos')}><Package size={26} aria-hidden="true"/><span className="category-count">{products.length} productos</span><h3>Productos</h3><p>Explora las presentaciones y consulta la información de cada producto.</p><span className="category-action">Explorar productos <ArrowRight size={17} aria-hidden="true"/></span></a>
          <a className="portal-category-card" href={portalHref(basePath,'videos')}><PlayCircle size={26} aria-hidden="true"/><span className="category-count">{videos.length} videos</span><h3>Videos</h3><p>Explicaciones sencillas para acompañarte paso a paso.</p><span className="category-action">Explorar videos <ArrowRight size={17} aria-hidden="true"/></span></a>
          <a className="portal-category-card" href={portalHref(basePath,'historias')}><MessageCircle size={26} aria-hidden="true"/><span className="category-count">{stories.length} historia</span><h3>Historias</h3><p>Encuentra experiencias para leer con calma.</p><span className="category-action">Explorar historias <ArrowRight size={17} aria-hidden="true"/></span></a>
        </div>
      </section>
    </>:<section className="content-wrap catalog-page" aria-labelledby="catalog-title">
      <header className="catalog-heading"><p className="eyebrow">{introductions[section][0]}</p><h1 id="catalog-title">{introductions[section][1]}</h1><p>{introductions[section][2]}</p></header>
      <form className="catalog-search" action={portalHref(basePath,section)} method="get" role="search">
        <label htmlFor="catalog-query">Buscar en {labels[section].toLowerCase()}</label>
        <div><Search size={18} aria-hidden="true"/><input id="catalog-query" name="q" type="search" defaultValue={query} maxLength={120} placeholder={section==='productos'?'Nombre o categoría':'Escribe lo que buscas'}/><button type="submit" className="primary-button">Buscar</button></div>
      </form>
      <div className="catalog-summary"><p role="status">{catalog.total} {catalog.total===1?'resultado':'resultados'}{query?` para “${query}”`:''}</p>{query&&<a href={portalHref(basePath,section)}>Limpiar búsqueda</a>}</div>
      {catalog.total===0?<div className="catalog-empty"><h2>No encontramos coincidencias</h2><p>Prueba con otra palabra o vuelve a ver todo el contenido.</p><a className="workspace-link" href={portalHref(basePath,section)}>Ver todo</a></div>:<>
        {section==='productos'&&<div className="product-grid">{productPage.items.map(product=><article className="product-card" key={product.id}>
          <div className="product-visual"><img src={product.image} alt={`Presentación de ${product.name}`} width={300} height={300} loading="lazy"/></div>
          <div className="product-copy"><p>{product.category}</p><h2>{product.name}</h2><dl><div><dt>Presentación</dt><dd>{product.presentation}</dd></div><div><dt>Contenido</dt><dd>{product.package??'Por confirmar'}</dd></div></dl><details className="product-instructions"><summary>Ver información</summary><h3>Ingredientes mencionados</h3><p>{product.ingredients??'Por confirmar.'}</p><h3>Indicaciones de uso</h3><p>{product.usage??'Indicaciones por confirmar.'}</p><h3>Por confirmar</h3><ul>{product.pending.map(item=><li key={item}>{item}</li>)}</ul><p className="product-source">Fuente: {product.source.join('; ')}. La lista de ingredientes es un resumen del material recibido; consulta la etiqueta vigente.</p></details></div>
        </article>)}</div>}
        {section==='videos'&&<><p className="sample-note">Material de muestra. Los videos estarán disponibles cuando se agregue su contenido.</p><div className="video-catalog-grid">{videoPage.items.map(video=><article className="video-catalog-card" key={video.title}><div className={`video-preview ${video.tone}`} aria-hidden="true"><PlayCircle size={44}/><span>{video.duration}</span></div><div><h2>{video.title}</h2><p>{video.description}</p></div></article>)}</div></>}
        {section==='historias'&&<><p className="sample-note">Historia de muestra de la biblioteca.</p><div className="story-catalog-grid">{storyPage.items.map(story=><article className="story-card" key={story.name}><div className="portrait-placeholder" aria-hidden="true">{story.name.slice(0,1)}</div><div><blockquote>“{story.quote}”</blockquote><p>{story.name} · {story.period}</p></div></article>)}</div></>}
        {catalog.pages>1&&<nav className="catalog-pagination" aria-label="Páginas del catálogo">{catalog.page>1?<a href={portalHref(basePath,section,query,catalog.page-1)}>← Anterior</a>:<span aria-disabled="true">← Anterior</span>}<span>Página {catalog.page} de {catalog.pages}</span>{catalog.page<catalog.pages?<a href={portalHref(basePath,section,query,catalog.page+1)}>Siguiente →</a>:<span aria-disabled="true">Siguiente →</span>}</nav>}
      </>}
    </section>}

    <button className="chat-trigger" onClick={()=>setChatOpen(!chatOpen)} aria-expanded={chatOpen} aria-label="Abrir asistente de preguntas"><span>?</span><b>Pregunta sobre tus productos</b></button>
    {chatOpen&&<aside className="chat-panel"><header><div><strong>Asistente Vita</strong><small>Responde con la información de esta guía</small></div><button onClick={()=>setChatOpen(false)} aria-label="Cerrar">×</button></header><div className="chat-body"><p className="bot-message">Hola, puedo ayudarte a consultar las presentaciones e información del catálogo.</p>{messages.map((message,index)=><p key={`${message}-${index}`} className={index%2===0?'user-message':'bot-message'}>{message}</p>)}{messages.length===0&&<div className="quick-questions"><button onClick={()=>ask('¿Qué sabores tiene Active Pro?')}>¿Qué sabores tiene Active Pro?</button><button onClick={()=>ask('¿Qué falta confirmar de HC-Fit?')}>¿Qué falta confirmar de HC-Fit?</button></div>}</div><form onSubmit={e=>{e.preventDefault();ask(question);}}><input value={question} onChange={e=>setQuestion(e.target.value)} aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta..."/><button aria-label="Enviar pregunta">↑</button></form></aside>}
    <footer><span>Vita Guía</span><p>La información de esta guía no sustituye la orientación de un profesional de la salud.</p></footer>
  </main>;
}
