import { requireAdminPage } from "../../admin-session";
import { ClientPortal } from "../../ClientPortal";

export const dynamic="force-dynamic";
export const metadata={title:"Biblioteca | Vita Guia",robots:{index:false,follow:false}};

export default async function AdminLibrary() {
  await requireAdminPage("/admin/biblioteca");
  return <ClientPortal recipientName="Administrador" workspaceLink={{href:"/admin",label:"Panel administrativo"}} showAdminLogout />;
}
