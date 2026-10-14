import { revokeAccessLink } from "../../../../db/access-links";
import { resolveLinkActor } from "../../admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await resolveLinkActor(request);
  if (!actor) return Response.json({ error: "Acceso no autorizado." }, { status: 401 });
  const { id } = await params;
  const link = await revokeAccessLink(Number(id), actor.advisor?.id);
  return link ? Response.json({ link }) : Response.json({ error: "Enlace no encontrado." }, { status: 404 });
}
