import { ADMIN_COOKIE, isValidAdminToken } from "../admin-session";
import { findAdvisorByToken } from "../../db/advisors";

function cookieValue(request:Request,name:string) {
  const cookies=request.headers.get("cookie")??"";
  for(const item of cookies.split(";")) {
    const [key,...parts]=item.trim().split("=");
    if(key===name)return decodeURIComponent(parts.join("="));
  }
  return null;
}

export async function requireAdminRequest(request:Request) {
  return isValidAdminToken(cookieValue(request,ADMIN_COOKIE))?{userId:"local-admin",email:"admin@local"}:null;
}

export async function resolveLinkActor(request:Request) {
  const advisorToken=request.headers.get("x-advisor-token")?.trim();
  if(advisorToken) {
    const advisor=await findAdvisorByToken(advisorToken);
    return advisor?{kind:"advisor" as const,userId:"advisor:"+advisor.id,advisor}:null;
  }
  const admin=await requireAdminRequest(request);
  return admin?{kind:"admin" as const,userId:admin.userId,advisor:null}:null;
}
