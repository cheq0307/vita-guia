import { requireAdminPage } from "../../admin-session";
import { ClientPortal } from "../../page";

export const dynamic="force-dynamic";
export const metadata={title:"Biblioteca | Vita Guia",robots:{index:false,follow:false}};

export default async function AdminLibrary() {
  await requireAdminPage("/admin/biblioteca");
  return <ClientPortal recipientName="Administrador"/>;
}
