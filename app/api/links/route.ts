import { createAccessLink, listAccessLinks } from "../../../db/access-links";
import { resolveLinkActor } from "../admin-auth";

export async function GET(request: Request) {
  const actor = await resolveLinkActor(request);
  if (!actor) return Response.json({ error: "Acceso no autorizado." }, { status: 401 });
  try {
    return Response.json({ links: await listAccessLinks(actor.advisor?.id) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible cargar los enlaces." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const actor = await resolveLinkActor(request);
  if (!actor) return Response.json({ error: "Acceso no autorizado." }, { status: 401 });
  try {
    const payload = await request.json() as { recipientName?: string; recipientContact?: string; validDays?: number; maxOpens?: number | null };
    const recipientName = payload.recipientName?.trim() ?? "";
    const validDays = Math.min(90, Math.max(1, Number(payload.validDays) || 7));
    const maxOpens = payload.maxOpens ? Math.min(100, Math.max(1, Number(payload.maxOpens))) : null;
    if (!recipientName) return Response.json({ error: "Escribe el nombre de la persona." }, { status: 400 });
    const link = await createAccessLink({ recipientName, recipientContact: payload.recipientContact?.trim() ?? "", validDays, maxOpens, createdBy: actor.userId, advisorId:actor.advisor?.id });
    return Response.json({ link }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible crear el enlace." }, { status: 500 });
  }
}
