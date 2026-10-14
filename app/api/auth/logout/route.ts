import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminCookieOptions } from "../../../admin-session";

export async function POST() {
  (await cookies()).set(ADMIN_COOKIE,"",{...adminCookieOptions(),maxAge:0});
  // A native form also signs out when client-side scripts have not loaded.
  return new Response(null, {
    status: 303,
    headers: { Location: "/login", "Cache-Control": "no-store" },
  });
}
