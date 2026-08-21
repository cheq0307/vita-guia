import { findAdvisorByToken } from "../../../../db/advisors";
import { ClientPortal } from "../../../page";

export const dynamic="force-dynamic";
export const metadata={title:"Biblioteca | Vita Guia",robots:{index:false,follow:false}};

export default async function AdvisorLibrary({params}:{params:Promise<{token:string}>}){
  const {token}=await params;
  const advisor=await findAdvisorByToken(token);
  if(!advisor)return <main className="access-screen"><div className="brand-mark">V</div><h1>Acceso no disponible</h1><p>Solicita un acceso nuevo al administrador.</p></main>;
  return <ClientPortal recipientName={advisor.name}/>;
}
