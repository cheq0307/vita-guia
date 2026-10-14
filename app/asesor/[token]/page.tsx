import { findAdvisorByToken } from "../../../db/advisors";
import AdminDashboard from "../../admin/AdminDashboard";

export const metadata={ title:"Acceso de usuario | Vita Guia", description:"Panel privado para compartir enlaces de Vita Guia.", robots:{ index:false, follow:false }, openGraph:{ title:"Acceso de usuario | Vita Guia", description:"Panel privado para compartir enlaces de Vita Guia.", images:[] }, twitter:{ title:"Acceso de usuario | Vita Guia", description:"Panel privado para compartir enlaces de Vita Guia.", images:[] } };

export const dynamic = "force-dynamic";

export default async function AdvisorPage({ params }:{ params:Promise<{token:string}> }) {
  const { token }=await params;
  const advisor=await findAdvisorByToken(token);
  if (!advisor) return <main className="access-screen"><div className="brand-mark">V</div><p className="eyebrow">Vita Guia</p><h1>Acceso de usuario no disponible</h1><p>Este acceso fue desactivado o no existe. Solicita uno nuevo al administrador.</p></main>;
  return <AdminDashboard advisorToken={token} advisorName={advisor.name}/>;
}
