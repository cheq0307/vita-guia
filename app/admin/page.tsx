import { requireAdminPage } from "../admin-session";
import AdminDashboard from "./AdminDashboard";

export const dynamic="force-dynamic";

export default async function AdminPage() {
  await requireAdminPage("/admin");
  return <AdminDashboard/>;
}
