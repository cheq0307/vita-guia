import { headers } from "next/headers";
import { chatGPTSignInPath, getChatGPTUser } from "../../chatgpt-auth";
import UserManager from "./UserManager";

export const dynamic="force-dynamic";

export default async function UsersPage(){
  const requestHeaders=await headers();
  const host=requestHeaders.get("host")??"";
  const isLocal=host.startsWith("localhost")||host.startsWith("127.0.0.1");
  const user=isLocal?{displayName:"Vista local"}:await getChatGPTUser();
  if(!user)return <main className="signin-screen"><div className="brand-mark">V</div><h1>Panel de Vita Guia</h1><p>Inicia sesion para administrar los usuarios que comparten enlaces.</p><a className="primary-button" href={chatGPTSignInPath("/admin/usuarios")}>Iniciar sesion</a></main>;
  return <UserManager/>;
}
