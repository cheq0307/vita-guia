import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireAdminPage } from './admin-session';
import { findAdvisorByToken } from '../db/advisors';
import { peekAccessLink } from '../db/access-links';
import { products } from './portal-content';
import { productHref } from './product-catalog';
import { ClientPortal } from './ClientPortal';
import { GuideUnavailable } from './GuideUnavailable';
import { GUIDE_COOKIE, hasGuideVisit } from './guide-visit';
import { catalogSearch, isPortalSection, portalHref } from './portal-navigation';
import {videoStore} from './videos/server';
import {videoFilter} from './videos/policy';

export type LibrarySearch={q?:string|string[];pagina?:string|string[];tipo?:string|string[]};
async function videoProps(section:string,search:LibrarySearch){const state=catalogSearch(search);const filter=videoFilter(search.tipo);if(section!=='videos'&&section!=='inicio')return {};const result=await videoStore().list(false,section==='videos'?state.query:'',section==='videos'?filter:'all',state.page);return {videoCatalog:result,videoType:filter}}
export async function adminLibrary(section:string,search:LibrarySearch={},productId?:string) {
  if(!isPortalSection(section))notFound();
  const basePath='/admin/biblioteca';
  const state=catalogSearch(search);
  await requireAdminPage(productId?productHref(basePath,productId,state.query,state.page):portalHref(basePath,section));
  const selectedProduct=selectedProductOr404(productId);
  return <ClientPortal basePath={basePath} section={section} selectedProduct={selectedProduct} {...state} {...await videoProps(section,search)} recipientName="Administrador" workspaceLink={{href:'/admin',label:'Panel administrativo'}} showAdminLogout/>;
}
export async function advisorLibrary(token:string,section:string,search:LibrarySearch={},productId?:string) {
  if(!isPortalSection(section))notFound();
  const advisor=await findAdvisorByToken(token);
  if(!advisor)return <main className="access-screen"><div className="brand-mark">V</div><h1>Acceso no disponible</h1><p>Solicita un acceso nuevo al administrador.</p></main>;
  const selectedProduct=selectedProductOr404(productId);
  const workspace='/asesor/'+encodeURIComponent(token);
  return <ClientPortal basePath={workspace+'/biblioteca'} section={section} selectedProduct={selectedProduct} {...catalogSearch(search)} {...await videoProps(section,search)} recipientName={advisor.name} workspaceLink={{href:workspace,label:'Mi panel'}}/>;
}
export async function customerLibrary(token:string,section:string,search:LibrarySearch={},productId?:string) {
  if(!isPortalSection(section))notFound();
  const link=await peekAccessLink(token);
  if(!link)return <GuideUnavailable status="missing"/>;
  if(link.revoked)return <GuideUnavailable status="revoked"/>;
  if(Date.parse(link.expiresAt)<=Date.now())return <GuideUnavailable status="expired"/>;
  const selectedProduct=selectedProductOr404(productId);
  const basePath='/guia/'+encodeURIComponent(token);
  const visit=(await cookies()).get(GUIDE_COOKIE)?.value;
  const state=catalogSearch(search);
  if(!hasGuideVisit(visit,token,process.env.ADMIN_SESSION_SECRET??'')) {
    const entry=new URLSearchParams({seccion:section});
    if(selectedProduct)entry.set('producto',selectedProduct.id);
    if(state.query)entry.set('q',state.query);
    if(state.page>1)entry.set('pagina',String(state.page));
    if(search.tipo==='file'||search.tipo==='link')entry.set('tipo',search.tipo);
    redirect(basePath+'?'+entry.toString());
  }
  return <ClientPortal basePath={basePath} section={section} selectedProduct={selectedProduct} {...state} {...await videoProps(section,search)} recipientName={link.recipientName} expiresAt={link.expiresAt}/>;
}

function selectedProductOr404(id?:string) {
  if(!id)return undefined;
  const product=products.find(p=>p.id===id);
  if(!product)notFound();
  return product;
}
