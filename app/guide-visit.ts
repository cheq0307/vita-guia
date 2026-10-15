import { createHmac, timingSafeEqual } from 'node:crypto';
export const GUIDE_COOKIE='vita_guide_visit';
export const GUIDE_VISIT_SECONDS=8*60*60;
function signature(payload:string,secret:string) { return createHmac('sha256',secret).update('guide-visit:'+payload).digest('base64url'); }
export function createGuideVisit(token:string,expiresAt:string,secret:string,now=Date.now()) {
  const until=Math.min(Date.parse(expiresAt),now+GUIDE_VISIT_SECONDS*1000);
  const payload=Buffer.from(JSON.stringify({token,until})).toString('base64url');
  return payload+'.'+signature(payload,secret);
}
export function hasGuideVisit(value:string|null|undefined,token:string,secret:string,now=Date.now()) {
  if(!value||!secret)return false;
  try {
    const [payload,mac,...extra]=value.split('.');
    if(!payload||!mac||extra.length)return false;
    const expected=Buffer.from(signature(payload,secret));
    const actual=Buffer.from(mac);
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;
    const visit=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    return visit.token===token&&typeof visit.until==='number'&&Number.isFinite(visit.until)&&visit.until>now;
  }catch{return false;}
}
