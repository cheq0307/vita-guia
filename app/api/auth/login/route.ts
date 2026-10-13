import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken, validAdminCredentials } from "../../../admin-session";
import { createLoginAttempts } from "../../../login-attempts";

const attempts = createLoginAttempts();

function cooldownResponse(retryAfter: number) {
  return Response.json(
    { error: "Hagamos una pausa breve. Después puedes volver a intentarlo.", retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}

export async function POST(request:Request) {
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now=Date.now();
  const retryAfter = attempts.retryAfter(ip, now);
  if (retryAfter) return cooldownResponse(retryAfter);

  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object"
    || !("username" in payload) || typeof payload.username !== "string"
    || !("password" in payload) || typeof payload.password !== "string") {
    const remaining = attempts.recordFailure(ip, now);
    if (remaining) return cooldownResponse(remaining);
    return Response.json({ error: "Escribe tu correo y contraseña para entrar." }, { status: 400 });
  }

  if (!validAdminCredentials(payload.username.trim(), payload.password)) {
    const remaining = attempts.recordFailure(ip, now);
    if (remaining) return cooldownResponse(remaining);
    return Response.json({ error: "Revisa tu correo y contraseña. Puedes mostrar la contraseña para comprobarla." }, { status: 401 });
  }
  attempts.clear(ip);
  (await cookies()).set(ADMIN_COOKIE,createAdminToken(),adminCookieOptions());
  return Response.json({ok:true});
}
