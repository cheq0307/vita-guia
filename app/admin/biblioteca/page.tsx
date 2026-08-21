import { headers } from "next/headers";
import { chatGPTSignInPath,getChatGPTUser } from "../../chatgpt-auth";
import { ClientPortal } from "../../page";

export const dynamic="force-dynamic";
export const metadata={title:"Biblioteca | Vita Guia",robots:{index:false,follow:false}};

export default async function AdminLibrary(){
  const requestHeaders=await headers();
  const host=requestHeaders.get("host")??"";
  const isLocal=host.startsWith("localhost")||host.startsWith("127.0.0.1");
  if(!isLocal&&!await getChatGPTUser())return <main className="signin-screen"><div className="brand-mark">V</div><h1>Panel de Vita Guia</h1><p>Inicia sesion para visualizar la biblioteca.</p><a className="primary-button" href={chatGPTSignInPath("/admin/biblioteca")}>Iniciar sesion</a></main>;
  return <ClientPortal recipientName="Administrador"/>;
}
