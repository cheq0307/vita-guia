import {products,type Product} from './portal-content';
import {portalHref} from './portal-navigation';
import {productHref} from './product-catalog';

export function ProductDetail({product,basePath,query,page}:{product:Product;basePath:string;query:string;page:number}) {
  const variants=products.filter(p=>p.family===product.family);
  return <section className="content-wrap product-detail" aria-labelledby="product-title">
    <nav className="product-breadcrumb" aria-label="Ruta del producto"><a href={portalHref(basePath,'productos',query,page)}>← Volver a productos</a><span aria-hidden="true">/</span><span>{product.family}</span></nav>
    <div className="product-detail-hero">
      <div className="product-detail-image"><img src={product.image} alt={product.name} width={600} height={600}/></div>
      <div className="product-detail-summary"><p className="eyebrow">HC Wellness · {product.category}</p><h1 id="product-title">{product.family}</h1>
        <p className="product-description">{product.description}</p>
        {variants.length>1?<fieldset className="product-variants"><legend>{product.family==='Active Pro'?'Sabor':'Presentación'}: <strong>{product.presentation}</strong></legend><div>{variants.map(variant=><a key={variant.id} href={productHref(basePath,variant.id,query,page)} aria-current={variant.id===product.id?'page':undefined}>{variant.presentation}</a>)}</div></fieldset>:<p className="product-presentation">{product.presentation}{product.package?` · ${product.package}`:''}</p>}
        {variants.length>1&&product.package&&<p className="product-presentation">{product.package}</p>}
        <section className="product-usage" aria-labelledby="usage-title"><h2 id="usage-title">Modo de uso</h2><p>{product.usage??`Indicaciones por confirmar. ${product.preparation??'Consulta la etiqueta vigente y a tu profesional de salud antes de usarlo.'}`}</p></section>
        <a className="product-read-more" href="#product-information">Consultar información del producto ↓</a>
      </div>
    </div>
    <div id="product-information" className="product-detail-information">
      {!!product.benefits?.length&&<section aria-labelledby="benefits-title"><h2 id="benefits-title">Beneficios nutricionales</h2><ul className="product-highlights">{product.benefits.map(benefit=><li key={benefit}>{benefit}</li>)}</ul></section>}
      <section aria-labelledby="highlights-title"><h2 id="highlights-title">Qué incluye</h2><ul className="product-highlights">{product.features.map(feature=><li key={feature}>{feature}</li>)}</ul></section>
      <section aria-labelledby="characteristics-title"><h2 id="characteristics-title">Características</h2><dl className="product-characteristics"><div><dt>Marca</dt><dd>HC Wellness</dd></div><div><dt>Línea</dt><dd>{product.line}</dd></div><div><dt>Tipo</dt><dd>{product.category}</dd></div><div><dt>Presentación</dt><dd>{product.presentation}</dd></div>{product.package&&<div><dt>Contenido</dt><dd>{product.package}</dd></div>}{product.origin&&<div><dt>País de fabricación</dt><dd>{product.origin}</dd></div>}</dl></section>
      <section aria-labelledby="ingredients-title"><h2 id="ingredients-title">Ingredientes mencionados</h2><p>{product.ingredients??'La composición completa está pendiente de confirmar.'}</p><p className="product-detail-caption">Resumen del material recibido. Consulta la lista completa en la etiqueta vigente.</p></section>
      {product.warnings.length>0&&<section aria-labelledby="warnings-title"><h2 id="warnings-title">Precauciones</h2><ul className="product-warnings">{product.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul></section>}
      {product.faqs.length>0&&<section className="product-faqs" aria-labelledby="faq-title"><h2 id="faq-title">Preguntas frecuentes</h2>{product.faqs.map(faq=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>}
      {product.pending.length>0&&<details className="product-pending"><summary>Información pendiente de confirmar</summary><ul>{product.pending.map(item=><li key={item}>{item}</li>)}</ul></details>}
      <details className="product-documentation"><summary>Fuentes de información</summary><ul>{product.source.map(source=><li key={source}>{source}</li>)}</ul></details>
    </div>
  </section>;
}
