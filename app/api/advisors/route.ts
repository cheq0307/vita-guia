import { createAdvisor, listAdvisors } from "../../../db/advisors";
import { requireAdminRequest } from "../admin-auth";

export async function GET(request:Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error:"Acceso no autorizado." }, { status:401 });
  return Response.json({ advisors:await listAdvisors() });
}

export async function POST(request:Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error:"Acceso no autorizado." }, { status:401 });
  const payload=await request.json() as { name?:string; contact?:string };
  const name=payload.name?.trim() ?? "";
  if (!name) return Response.json({ error:"Escribe el nombre del usuario." }, { status:400 });
  return Response.json({ advisor:await createAdvisor(name,payload.contact?.trim() ?? "") }, { status:201 });
}
