import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return <form className="logout-form" action="/api/auth/logout" method="post">
    <button className="logout-button" type="submit">
      <LogOut size={18} aria-hidden="true" />Cerrar sesión
    </button>
  </form>;
}
