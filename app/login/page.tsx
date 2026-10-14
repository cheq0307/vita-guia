import { safeAdminReturnTo } from "../admin-session";
import LoginForm from "./LoginForm";

export const metadata={title:"Acceso administrativo | Vita Guia",robots:{index:false,follow:false}};

export default async function LoginPage({searchParams}:{searchParams:Promise<{returnTo?:string}>}) {
  const params=await searchParams;
  return <LoginForm returnTo={safeAdminReturnTo(params.returnTo)}/>;
}
