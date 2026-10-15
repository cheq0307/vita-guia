import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireAdminPage } from './admin-session';
import { findAdvisorByToken } from '../db/advisors';
import { peekAccessLink } from '../db/access-links';
import { ClientPortal } from './ClientPortal';
import { GuideUnavailable } from './GuideUnavailable';
import { GUIDE_COOKIE, hasGuideVisit } from './guide-visit';
import { catalogSearch, isPortalSection, portalHref } from './portal-navigation';

export type LibrarySearch={q?:string|string[];pagina?:string|string[]};
export async function adminLibrary(section:string,search:LibrarySearch={}) {
  if(!isPortalSection(section))notFound();
  const basePath='/admin/biblioteca';
  await requireAdminPage(portalHref(basePath,section));
  return <ClientPortal basePath={basePath} section={section} {...catalogSearch(search)} recipientName="Administrador" workspaceLink={{href:'/admin',label:'Panel administrativo'}} showAdminLogout/>;
}
export async function advisorLibrary(token:string,section:string,search:LibrarySearch={}) {
  if(!isPortalSection(section))notFound();
  const advisor=await findAdvisorByToken(token);
  if(!advisor)return <main className="access-screen"><div className="brand-mark">V</div><h1>Acceso no disponible</h1><p>Solicita un acceso nuevo al administrador.</p></main>;
  const workspace='/asesor/'+encodeURIComponent(token);
  return <ClientPortal basePath={workspace+'/biblioteca'} section={section} {...catalogSearch(search)} recipientName={advisor.name} workspaceLink={{href:workspace,label:'Mi panel'}}/>;
}
export async function customerLibrary(token:string,section:string,search:LibrarySearch={}) {
  if(!isPortalSection(section))notFound();
  const link=await peekAccessLink(token);
  if(!link)return <GuideUnavailable status="missing"/>;
  if(link.revoked)return <GuideUnavailable status="revoked"/>;
  if(Date.parse(link.expiresAt)<=Date.now())return <GuideUnavailable status="expired"/>;
  const basePath='/guia/'+encodeURIComponent(token);
  const visit=(await cookies()).get(GUIDE_COOKIE)?.value;
  const state=catalogSearch(search);
  if(!hasGuideVisit(visit,token,process.env.ADMIN_SESSION_SECRET??'')) {
    const entry=new URLSearchParams({seccion:section});
    if(state.query)entry.set('q',state.query);
    if(state.page>1)entry.set('pagina',String(state.page));
    redirect(basePath+'?'+entry.toString());
  }
  return <ClientPortal basePath={basePath} section={section} {...state} recipientName={link.recipientName} expiresAt={link.expiresAt}/>;
}
