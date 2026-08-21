import type { Metadata } from "next";
import { openAccessLink, peekAccessLink } from "../../../db/access-links";
import { ClientPortal } from "../../page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token:string }> }): Promise<Metadata> {
  const { token } = await params;
  const link = await peekAccessLink(token).catch(() => null);
  const title = link ? `Guia de ${link.recipientName} | Vita Guia` : "Acceso a Vita Guia";
  const description = link ? `Biblioteca de productos y orientacion compartida con ${link.recipientName}.` : "Biblioteca privada de productos y orientacion.";
  return { title, description, robots:{ index:false, follow:false }, openGraph:{ title, description, images:[] }, twitter:{ title, description, images:[] } };
}

const messages = {
  missing:["Enlace no encontrado", "Revisa que el enlace este completo o solicita uno nuevo a la persona que te lo compartio."],
  revoked:["Este enlace fue desactivado", "Solicita un enlace nuevo para volver a consultar la guia."],
  expired:["Este enlace ya vencio", "La vigencia termino. La persona que te lo compartio puede generar otro en unos segundos."],
  limit:["Este enlace alcanzo su limite", "Solicita un enlace nuevo para volver a entrar."],
} as const;

export default async function GuidePage({ params }: { params: Promise<{ token:string }> }) {
  const { token } = await params;
  const access = await openAccessLink(token);
  if (access.status !== "active") {
    const [title, detail] = messages[access.status];
    return <main className="access-screen"><div className="brand-mark">V</div><p className="eyebrow">Vita Guia</p><h1>{title}</h1><p>{detail}</p></main>;
  }
  return <ClientPortal recipientName={access.link.recipientName} expiresAt={access.link.expiresAt} />;
}
