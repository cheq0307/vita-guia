import { requireAdminPage } from "../../admin-session";
import UserManager from "./UserManager";

export const dynamic="force-dynamic";

export default async function UsersPage() {
  await requireAdminPage("/admin/usuarios");
  return <UserManager/>;
}
