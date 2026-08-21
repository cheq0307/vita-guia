import { env } from "cloudflare:workers";

export type Advisor = { id:number; name:string; contact:string; token:string; active:boolean; createdAt:string };

const createTable = `CREATE TABLE IF NOT EXISTS advisors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  token TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

function db() { if (!env.DB) throw new Error("La base de datos de usuarios no esta disponible."); return env.DB; }

function mapRow(row:Record<string,unknown>):Advisor { return { id:Number(row.id), name:String(row.name), contact:String(row.contact ?? ""), token:String(row.token), active:Boolean(row.active), createdAt:String(row.created_at) }; }

export async function ensureAdvisorSchema() { await db().prepare(createTable).run(); }

export async function listAdvisors() { await ensureAdvisorSchema(); const result=await db().prepare("SELECT * FROM advisors ORDER BY created_at DESC, id DESC").all(); return (result.results as Record<string,unknown>[]).map(mapRow); }

export async function createAdvisor(name:string, contact:string) { await ensureAdvisorSchema(); const token=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,12); const row=await db().prepare("INSERT INTO advisors (name, contact, token) VALUES (?, ?, ?) RETURNING *").bind(name,contact,token).first(); return mapRow(row as Record<string,unknown>); }

export async function findAdvisorByToken(token:string) { await ensureAdvisorSchema(); const row=await db().prepare("SELECT * FROM advisors WHERE token = ? AND active = 1 LIMIT 1").bind(token).first(); return row ? mapRow(row as Record<string,unknown>) : null; }

export async function toggleAdvisor(id:number) { await ensureAdvisorSchema(); const row=await db().prepare("UPDATE advisors SET active = CASE active WHEN 1 THEN 0 ELSE 1 END WHERE id = ? RETURNING *").bind(id).first(); return row ? mapRow(row as Record<string,unknown>) : null; }
