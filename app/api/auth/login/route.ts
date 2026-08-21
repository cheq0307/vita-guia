import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken, validAdminCredentials } from "../../../admin-session";

type Attempt = { count:number; resetAt:number };
const attempts = new Map<string,Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(request:Request) {
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now=Date.now();
  const current=attempts.get(ip);
  if(current&&current.resetAt>now&&current.count>=MAX_ATTEMPTS) return Response.json({error:"Demasiados intentos. Espera 15 minutos."},{status:429});
  const payload=await request.json().catch(()=>null) as {username?:string;password?:string}|null;
  if(!payload||!validAdminCredentials(payload.username?.trim()??"",payload.password??"")) {
    const next=current&&current.resetAt>now?{...current,count:current.count+1}:{count:1,resetAt:now+WINDOW_MS};
    attempts.set(ip,next);
    return Response.json({error:"Usuario o contrasena incorrectos."},{status:401});
  }
  attempts.delete(ip);
  (await cookies()).set(ADMIN_COOKIE,createAdminToken(),adminCookieOptions());
  return Response.json({ok:true});
}
