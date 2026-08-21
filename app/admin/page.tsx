import { headers } from "next/headers";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const user = isLocal ? { displayName:"Vista local" } : await getChatGPTUser();
  if (!user) return <main className="signin-screen"><div className="brand-mark">V</div><h1>Panel de Vita Guia</h1><p>Inicia sesion para crear, consultar y revocar enlaces de acceso.</p><a className="primary-button" href={chatGPTSignInPath("/admin")}>Iniciar sesion</a></main>;
  return <AdminDashboard />;
}
