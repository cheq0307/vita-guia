"use client";

import AssistantChat from "./assistant/AssistantChat";
import { ArrowLeft, ArrowRight, Package, PlayCircle, MessageCircle, Search, Home, Sparkles } from "lucide-react";
import { ProductDetail } from "./ProductDetail";
import { productFamilies, productHref } from "./product-catalog";
import LogoutButton from "./LogoutButton";
import { products, type Product } from "./portal-content";
import StoryCatalog from './stories/StoryCatalog';
import type {StoryPage} from './stories/policy';
import VideoCatalog from './videos/VideoCatalog';
import type {VideoPage,VideoFilter} from './videos/policy';
import { catalogPage, portalHref, type PortalSection } from "./portal-navigation";

type ClientPortalProps={basePath:string;section?:PortalSection;query?:string;page?:number;recipientName?:string;expiresAt?:string;workspaceLink?:{href:string;label:string};showAdminLogout?:boolean;selectedProduct?:Product;videoCatalog?:VideoPage;videoType?:VideoFilter;storyCatalog?:StoryPage;chatProductId?:string};
const labels:Record<PortalSection,string>={inicio:'Inicio',productos:'Productos',videos:'Videos',historias:'Historias',chat:'Chat'};
const navIcons={inicio:Home,productos:Package,videos:PlayCircle,historias:MessageCircle,chat:Sparkles};
const introductions={productos:['HC Wellness','Catálogo de productos','Encuentra cada producto y consulta sus indicaciones en un solo lugar.'],videos:['Paso a paso','Aprende a tu ritmo','Busca una explicación y vuelve a ella cuando la necesites.'],historias:['Experiencias con los productos','Historias de éxito','Conoce qué han compartido otras personas sobre su experiencia con los nutracéuticos.']} as const;

export function ClientPortal({basePath,section='inicio',query='',page=1,recipientName='',expiresAt,workspaceLink,showAdminLogout=false,selectedProduct,videoCatalog={items:[],total:0,page:1,pages:1},videoType='all',storyCatalog={items:[],total:0,page:1,pages:1},chatProductId}:ClientPortalProps) {
  const expiryLabel=expiresAt?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long'}).format(new Date(expiresAt)):'';
  const families=productFamilies(products,query);
  const productPage=catalogPage(families,'',page,p=>p.product.name);
  const catalog=productPage;

  return <main className={`portal-shell portal-v2 ${section==='chat'?'chat-page':''}`} data-version="2.0.0"><a className="skip-link" href="#portal-content">Ir al contenido</a>
    <header className="topbar">
      <a className="brand" href={portalHref(basePath,'inicio')} aria-label="Vita Guía inicio"><span className="brand-mark">V</span><span>Vita Guía <small className="version-badge">v2</small></span></a>
      <div className={showAdminLogout?'topbar-actions admin-preview-actions':'topbar-actions'}>
        {workspaceLink&&<a className="workspace-link workspace-link-outline" href={workspaceLink.href}><ArrowLeft size={18} aria-hidden="true"/>{workspaceLink.label}</a>}
        {showAdminLogout&&<LogoutButton/>}
      </div>
    </header>
    <nav className="section-nav" aria-label="Secciones principales">
      {(Object.keys(labels) as PortalSection[]).map(id=>{const Icon=navIcons[id];return <a key={id} href={portalHref(basePath,id)} className={section===id?'active':''} aria-current={section===id?'page':undefined}><Icon size={21} aria-hidden="true"/><span>{labels[id]}</span></a>})}
    </nav>
    <div id="portal-content" className="portal-content">
    {selectedProduct?<ProductDetail product={selectedProduct} basePath={basePath} query={query} page={page} showSources={showAdminLogout}/>:section==='inicio'?<>
      <section className="welcome-band">
        <div><p className="eyebrow">{recipientName?`Hola, ${recipientName}`:'Tu guía personal'}</p><h1>Tu guía de bienestar.</h1><p className="intro">Encuentra tus productos y resuelve tus dudas a tu ritmo.</p></div>
        {!workspaceLink&&expiryLabel&&<p className="guide-validity">Tu acceso está disponible hasta el {expiryLabel}.</p>}
        <form className="home-search" action={portalHref(basePath,'productos')} method="get" role="search"><label htmlFor="home-product-search">Buscar un producto</label><div><Search size={19} aria-hidden="true"/><input id="home-product-search" name="q" type="search" maxLength={120} placeholder="Nombre del producto"/><button className="primary-button">Buscar</button></div></form>
      </section>
      <section className="content-wrap portal-overview" aria-labelledby="overview-heading">
        <div className="section-heading"><div><p className="eyebrow">Tu biblioteca</p><h2 id="overview-heading">¿Por dónde empezamos?</h2></div></div>
        <div className="portal-category-grid">
          <a className="portal-category-card" href={portalHref(basePath,'productos')}><Package size={26} aria-hidden="true"/><span className="category-count">{productFamilies(products,'').length} productos</span><h3>Productos</h3><p>Explora las presentaciones y consulta la información de cada producto.</p><span className="category-action">Explorar productos <ArrowRight size={17} aria-hidden="true"/></span></a>
          <a className="portal-category-card" href={portalHref(basePath,'videos')}><PlayCircle size={26} aria-hidden="true"/><span className="category-count">{videoCatalog.total} contenidos</span><h3>Videos y enlaces</h3><p>Explicaciones y recursos para acompañarte paso a paso.</p><span className="category-action">Explorar videos <ArrowRight size={17} aria-hidden="true"/></span></a>
          <a className="portal-category-card" href={portalHref(basePath,'historias')}><MessageCircle size={26} aria-hidden="true"/><span className="category-count">{storyCatalog.total} {storyCatalog.total===1?'historia':'historias'}</span><h3>Historias de éxito</h3><p>Experiencias de personas que integraron los productos a su vida.</p><span className="category-action">Explorar historias <ArrowRight size={17} aria-hidden="true"/></span></a>
        </div>
      </section>
    </>:section==='chat'?<section className="chat-route"><AssistantChat basePath={basePath} productId={chatProductId} fullPage/></section>:<section className={`content-wrap catalog-page ${section==='productos'?'product-catalog':''}`} aria-labelledby="catalog-title">
      <div className="catalog-toolbar">
      <header className="catalog-heading"><p className="eyebrow">{introductions[section][0]}</p><h1 id="catalog-title">{introductions[section][1]}</h1><p>{introductions[section][2]}</p></header>
      <form className="catalog-search" action={portalHref(basePath,section)} method="get" role="search">
        {section==='videos'&&videoType!=='all'&&<input type="hidden" name="tipo" value={videoType}/>}
        <label htmlFor="catalog-query">Buscar en {labels[section].toLowerCase()}</label>
        <div><Search size={18} aria-hidden="true"/><input id="catalog-query" name="q" type="search" defaultValue={query} maxLength={120} placeholder={section==='productos'?'Nombre o categoría':'Escribe lo que buscas'}/><button type="submit" className="primary-button">Buscar</button></div>
      </form>
      </div>
      {section==='videos'?<VideoCatalog basePath={basePath} query={query} filter={videoType} catalog={videoCatalog} canManage={showAdminLogout}/>:section==='historias'?<StoryCatalog catalog={storyCatalog} basePath={basePath} query={query} canManage={showAdminLogout}/>:<>
      <div className="catalog-summary"><p role="status">{catalog.total} {catalog.total===1?'resultado':'resultados'}{query?` para “${query}”`:''}</p>{query&&<a href={portalHref(basePath,section)}>Limpiar búsqueda</a>}</div>
      {catalog.total===0?<div className="catalog-empty"><h2>No encontramos coincidencias</h2><p>Prueba con otra palabra o vuelve a ver todo el contenido.</p><a className="workspace-link" href={portalHref(basePath,section)}>Ver todo</a></div>:<>
        {section==='productos'&&<div className="product-grid">{productPage.items.map(({product,variants})=><article className="product-card" key={product.family}>
          <a className="product-card-link" href={productHref(basePath,product.id,query,productPage.page)} aria-label={`Ver producto: ${product.family}`}>
            <div className="product-visual"><img src={product.image} alt={product.name} width={300} height={300} loading="lazy"/></div>
            <div className="product-copy"><p>{product.category}</p><h2>{product.family}</h2><p className="product-card-meta">{variants.length>1?`${variants.length} ${product.family==='Active Pro'?'sabores':'presentaciones'}`:product.package??product.presentation}</p><span className="product-card-action">Ver producto <ArrowRight size={16} aria-hidden="true"/></span></div>
          </a>
        </article>)}</div>}
        {catalog.pages>1&&<nav className="catalog-pagination" aria-label="Páginas del catálogo">{catalog.page>1?<a href={portalHref(basePath,section,query,catalog.page-1)}>← Anterior</a>:<span aria-disabled="true">← Anterior</span>}<span>Página {catalog.page} de {catalog.pages}</span>{catalog.page<catalog.pages?<a href={portalHref(basePath,section,query,catalog.page+1)}>Siguiente →</a>:<span aria-disabled="true">Siguiente →</span>}</nav>}
      </>}
      </>}
    </section>}

    </div>
    {section!=='chat'&&<AssistantChat basePath={basePath} productId={selectedProduct?.id}/>}

    <footer><span>Vita Guía</span><p>La información de esta guía no sustituye la orientación de un profesional de la salud.</p></footer>
  </main>;
}
