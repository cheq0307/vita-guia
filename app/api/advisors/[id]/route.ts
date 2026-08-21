import { toggleAdvisor } from "../../../../db/advisors";
import { requireAdminRequest } from "../../admin-auth";

export async function PATCH(request:Request,{ params }:{ params:Promise<{id:string}> }) {
  if (!await requireAdminRequest(request)) return Response.json({ error:"Acceso no autorizado." }, { status:401 });
  const { id }=await params;
  const advisor=await toggleAdvisor(Number(id));
  return advisor ? Response.json({ advisor }) : Response.json({ error:"Usuario no encontrado." }, { status:404 });
}
