import { cookies } from 'next/headers';
import { openAccessLink, peekAccessLink } from '../../../db/access-links';
import { GUIDE_COOKIE, GUIDE_VISIT_SECONDS, createGuideVisit, hasGuideVisit } from '../../guide-visit';
import { catalogSearch, isPortalSection, portalHref } from '../../portal-navigation';
import { guideMessages } from '../../GuideUnavailable';
export const dynamic='force-dynamic';

export async function GET(request:Request,{params}:{params:Promise<{token:string}>}) {
  const {token}=await params;
  const basePath='/guia/'+encodeURIComponent(token);
  const requested=new URL(request.url).searchParams;
  const desired=requested.get('seccion')??'inicio';
  const state=catalogSearch({q:requested.get('q'),pagina:requested.get('pagina')});
  const section=isPortalSection(desired)?desired:'inicio';
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!secret)throw new Error('El acceso temporal no está configurado.');
  const cookieStore=await cookies();
  const current=await peekAccessLink(token);
  const existingVisit=current&&!current.revoked&&Date.parse(current.expiresAt)>Date.now()&&hasGuideVisit(cookieStore.get(GUIDE_COOKIE)?.value,token,secret);
  const access=existingVisit?{status:'active' as const,link:current}:await openAccessLink(token);
  if(access.status!=='active') {
    const [title,detail]=guideMessages[access.status];
    return new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} | Vita Guía</title><body style="margin:0;background:#f7f8f4;color:#18211d;font:18px/1.6 Arial,sans-serif"><main style="max-width:560px;margin:18vh auto;padding:24px;text-align:center"><p style="color:#1c6b52;font-weight:bold">Vita Guía</p><h1>${title}</h1><p>${detail}</p></main></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
  }
  if(!existingVisit)cookieStore.set(GUIDE_COOKIE,createGuideVisit(token,access.link.expiresAt,secret),{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE==='true',path:basePath,maxAge:Math.max(1,Math.min(GUIDE_VISIT_SECONDS,Math.floor((Date.parse(access.link.expiresAt)-Date.now())/1000)))});
  return new Response(null,{status:303,headers:{Location:portalHref(basePath,section,state.query,state.page),'Cache-Control':'no-store'}});
}
