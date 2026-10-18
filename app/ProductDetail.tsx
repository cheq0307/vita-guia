import {products,type Product} from './portal-content';
import {portalHref} from './portal-navigation';
import {productHref} from './product-catalog';

export function ProductDetail({product,basePath,query,page,showSources=false}:{product:Product;basePath:string;query:string;page:number;showSources?:boolean}) {
  const variants=products.filter(p=>p.family===product.family);
  return <section className="content-wrap product-detail" aria-labelledby="product-title">
    <nav className="product-breadcrumb" aria-label="Ruta del producto"><a href={portalHref(basePath,'productos',query,page)}>← Volver a productos</a><span aria-hidden="true">/</span><span>{product.family}</span></nav>
    <div className="product-detail-hero">
      <div className="product-detail-image"><img src={product.image} alt={product.name} width={600} height={600}/></div>
      <div className="product-detail-summary"><p className="eyebrow">HC Wellness · {product.category}</p><h1 id="product-title">{product.family}</h1>
        {product.package&&<p className="product-presentation product-net-content">{product.package}</p>}
        <p className="product-description">{product.description}</p>
        {variants.length>1?<fieldset className="product-variants"><legend>{product.family==='Active Pro'?'Sabor':'Presentación'}: <strong>{product.presentation}</strong></legend><div>{variants.map(variant=><a key={variant.id} href={productHref(basePath,variant.id,query,page)} aria-current={variant.id===product.id?'page':undefined}>{variant.presentation}</a>)}</div></fieldset>:<p className="product-presentation">{product.presentation}</p>}
        <details className="product-usage"><summary id="usage-title">Cómo se usa</summary><p>{product.usage??`Indicaciones por confirmar. ${product.preparation??'Consulta la etiqueta vigente y a tu profesional de salud antes de usarlo.'}`}</p></details>
        <a className="primary-button product-chat-action" href={portalHref(basePath,'chat')+'?producto='+encodeURIComponent(product.id)}>Preguntar sobre este producto</a>
      </div>
    </div>
    <div id="product-information" className="product-detail-information">
      <details className="product-info-section"><summary>Para qué sirve</summary><div><p>{product.purpose??product.description}</p></div></details>
      {!!product.benefits?.length&&<details className="product-info-section"><summary id="benefits-title">{product.family==='Active Pro'?'Beneficios nutricionales':'Enfoque y beneficios'}</summary><div><ul className="product-highlights">{product.benefits.map(benefit=><li key={benefit}>{benefit}</li>)}</ul></div></details>}
      <details className="product-info-section"><summary id="highlights-title">Qué incluye</summary><div><ul className="product-highlights">{product.features.map(feature=><li key={feature}>{feature}</li>)}</ul></div></details>
      <details className="product-info-section"><summary id="characteristics-title">Características</summary><div><dl className="product-characteristics"><div><dt>Marca</dt><dd>HC Wellness</dd></div><div><dt>Línea</dt><dd>{product.line}</dd></div><div><dt>Tipo</dt><dd>{product.category}</dd></div><div><dt>Presentación</dt><dd>{product.presentation}</dd></div>{product.package&&<div><dt>Contenido</dt><dd>{product.package}</dd></div>}{product.origin&&<div><dt>País de fabricación</dt><dd>{product.origin}</dd></div>}</dl></div></details>
      <details className="product-info-section"><summary id="ingredients-title">Ingredientes mencionados</summary><div><p>{product.ingredients??'La composición completa está pendiente de confirmar.'}</p><p className="product-detail-caption">Consulta la lista completa en la etiqueta del envase.</p></div></details>
      {product.warnings.length>0&&<details className="product-info-section"><summary id="warnings-title">Precauciones</summary><div><ul className="product-warnings">{product.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul></div></details>}
      {product.faqs.length>0&&<details className="product-faqs product-info-section"><summary id="faq-title">Preguntas frecuentes</summary>{product.faqs.map(faq=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</details>}
      {product.pending.length>0&&<details className="product-pending"><summary>Información pendiente de confirmar</summary><ul>{product.pending.map(item=><li key={item}>{item}</li>)}</ul></details>}
      {showSources&&<details className="product-documentation"><summary>Fuentes de información</summary><ul>{product.source.map(source=><li key={source}>{source}</li>)}</ul></details>}
    </div>
  </section>;
}
