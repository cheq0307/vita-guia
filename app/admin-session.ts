import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "vita_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

function hash(value: string) { return createHash("sha256").update(value).digest(); }
function safeEqual(left: string, right: string) { return timingSafeEqual(hash(left), hash(right)); }
function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Configura ADMIN_SESSION_SECRET en .env.local.");
  return secret;
}

export function validAdminCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPassword);
}

export function createAdminToken() {
  const username = process.env.ADMIN_USERNAME ?? "";
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = Buffer.from(username + "." + expiresAt).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return payload + "." + signature;
}

export function isValidAdminToken(token?: string | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return false;
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const separator = decoded.lastIndexOf(".");
    const username = decoded.slice(0, separator);
    const expiresAt = Number(decoded.slice(separator + 1));
    return username === process.env.ADMIN_USERNAME && Number.isFinite(expiresAt) && expiresAt > Date.now() / 1000;
  } catch { return false; }
}

export function safeAdminReturnTo(value?: string | null) {
  return value?.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function requireAdminPage(returnTo: string) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(token)) redirect("/login?returnTo=" + encodeURIComponent(safeAdminReturnTo(returnTo)));
}

export function adminCookieOptions() {
  return { httpOnly:true, sameSite:"lax" as const, secure:process.env.COOKIE_SECURE === "true", path:"/", maxAge:SESSION_SECONDS };
}
