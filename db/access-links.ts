import { env } from "cloudflare:workers";

export type AccessLink = {
  id: number;
  token: string;
  advisorId: number | null;
  recipientName: string;
  recipientContact: string;
  expiresAt: string;
  maxOpens: number | null;
  openCount: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  revoked: boolean;
  createdAt: string;
};

const createTable = `CREATE TABLE IF NOT EXISTS access_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  advisor_id INTEGER REFERENCES advisors(id),
  recipient_name TEXT NOT NULL,
  recipient_contact TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL,
  max_opens INTEGER,
  open_count INTEGER NOT NULL DEFAULT 0,
  first_opened_at TEXT,
  last_opened_at TEXT,
  revoked INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL DEFAULT 'local-admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const createExpiryIndex = "CREATE INDEX IF NOT EXISTS idx_access_links_expires_at ON access_links(expires_at)";

function db() {
  if (!env.DB) throw new Error("La base de datos de enlaces no esta disponible.");
  return env.DB;
}

export async function ensureAccessSchema() {
  const d1 = db();
  await d1.batch([d1.prepare(createTable), d1.prepare(createExpiryIndex)]);
  const columns = await d1.prepare("PRAGMA table_info(access_links)").all();
  if (!(columns.results as Record<string, unknown>[]).some((column) => column.name === "advisor_id")) {
    await d1.prepare("ALTER TABLE access_links ADD COLUMN advisor_id INTEGER REFERENCES advisors(id)").run();
  }
}

function mapRow(row: Record<string, unknown>): AccessLink {
  return {
    id: Number(row.id), token: String(row.token), advisorId: row.advisor_id == null ? null : Number(row.advisor_id), recipientName: String(row.recipient_name),
    recipientContact: String(row.recipient_contact ?? ""), expiresAt: String(row.expires_at),
    maxOpens: row.max_opens == null ? null : Number(row.max_opens), openCount: Number(row.open_count),
    firstOpenedAt: row.first_opened_at ? String(row.first_opened_at) : null,
    lastOpenedAt: row.last_opened_at ? String(row.last_opened_at) : null,
    revoked: Boolean(row.revoked), createdAt: String(row.created_at),
  };
}

export async function listAccessLinks(advisorId?: number) {
  await ensureAccessSchema();
  const statement = advisorId
    ? db().prepare("SELECT * FROM access_links WHERE advisor_id = ? ORDER BY created_at DESC, id DESC LIMIT 100").bind(advisorId)
    : db().prepare("SELECT * FROM access_links ORDER BY created_at DESC, id DESC LIMIT 100");
  const result = await statement.all();
  return (result.results as Record<string, unknown>[]).map(mapRow);
}

export async function createAccessLink(input: { recipientName: string; recipientContact: string; validDays: number; maxOpens: number | null; createdBy: string; advisorId?: number | null; }) {
  await ensureAccessSchema();
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  const expiresAt = new Date(Date.now() + input.validDays * 86400000).toISOString();
  const result = await db().prepare(`INSERT INTO access_links (token, advisor_id, recipient_name, recipient_contact, expires_at, max_opens, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`).bind(token, input.advisorId ?? null, input.recipientName, input.recipientContact, expiresAt, input.maxOpens, input.createdBy).first();
  return mapRow(result as Record<string, unknown>);
}

export async function revokeAccessLink(id: number, advisorId?: number) {
  await ensureAccessSchema();
  const statement = advisorId
    ? db().prepare("UPDATE access_links SET revoked = 1 WHERE id = ? AND advisor_id = ? RETURNING *").bind(id, advisorId)
    : db().prepare("UPDATE access_links SET revoked = 1 WHERE id = ? RETURNING *").bind(id);
  const result = await statement.first();
  return result ? mapRow(result as Record<string, unknown>) : null;
}

export async function openAccessLink(token: string) {
  await ensureAccessSchema();
  const row = await db().prepare("SELECT * FROM access_links WHERE token = ? LIMIT 1").bind(token).first();
  if (!row) return { status: "missing" as const, link: null };
  const link = mapRow(row as Record<string, unknown>);
  if (link.revoked) return { status: "revoked" as const, link };
  if (new Date(link.expiresAt).getTime() <= Date.now()) return { status: "expired" as const, link };
  if (link.maxOpens !== null && link.openCount >= link.maxOpens) return { status: "limit" as const, link };

  const now = new Date().toISOString();
  const updated = await db().prepare(`UPDATE access_links SET open_count = open_count + 1,
    first_opened_at = COALESCE(first_opened_at, ?), last_opened_at = ? WHERE id = ? RETURNING *`)
    .bind(now, now, link.id).first();
  return { status: "active" as const, link: mapRow(updated as Record<string, unknown>) };
}

export async function peekAccessLink(token: string) {
  await ensureAccessSchema();
  const row = await db().prepare("SELECT * FROM access_links WHERE token = ? LIMIT 1").bind(token).first();
  return row ? mapRow(row as Record<string, unknown>) : null;
}
