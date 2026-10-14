export type Advisor = { id:number; name:string; contact:string; token:string; active:boolean; createdAt:string };
export type AccessLink = { id:number; token:string; advisorId:number|null; recipientName:string; recipientContact:string; expiresAt:string; maxOpens:number|null; openCount:number; firstOpenedAt:string|null; lastOpenedAt:string|null; revoked:boolean; createdAt:string };
type Row = Record<string, unknown>;
type Value = string | number | null;
type Statement = { bind(...values:Value[]):Statement; first<T = Row>():Promise<T|null>; all<T = Row>():Promise<{results:T[]}> };
export type Database = { prepare(sql:string):Statement };

function advisor(row:Row):Advisor {
  return { id:Number(row.id), name:String(row.name), contact:String(row.contact ?? ''), token:String(row.token), active:Boolean(row.active), createdAt:String(row.created_at) };
}
function link(row:Row):AccessLink {
  return { id:Number(row.id), token:String(row.token), advisorId:row.advisor_id == null ? null : Number(row.advisor_id), recipientName:String(row.recipient_name), recipientContact:String(row.recipient_contact ?? ''), expiresAt:String(row.expires_at), maxOpens:row.max_opens == null ? null : Number(row.max_opens), openCount:Number(row.open_count), firstOpenedAt:row.first_opened_at ? String(row.first_opened_at) : null, lastOpenedAt:row.last_opened_at ? String(row.last_opened_at) : null, revoked:Boolean(row.revoked), createdAt:String(row.created_at) };
}
function newToken() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '').slice(0, 12); }

export class VitaRepository {
  private database:Database;
  constructor(database:Database) { this.database = database; }
  private statement(sql:string, values:Value[] = []) { return this.database.prepare(sql).bind(...values); }
  async listAdvisors() {
    return (await this.statement('SELECT * FROM advisors ORDER BY created_at DESC, id DESC').all()).results.map(advisor);
  }
  async createAdvisor(name:string, contact:string) {
    const row = await this.statement('INSERT INTO advisors (name, contact, token) VALUES (?, ?, ?) RETURNING *', [name, contact, newToken()]).first();
    if (!row) throw new Error('No fue posible crear al asesor.');
    return advisor(row);
  }
  async findAdvisorByToken(token:string) {
    const row = await this.statement('SELECT * FROM advisors WHERE token = ? AND active = 1 LIMIT 1', [token]).first();
    return row ? advisor(row) : null;
  }
  async toggleAdvisor(id:number) {
    const row = await this.statement('UPDATE advisors SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ? RETURNING *', [id]).first();
    return row ? advisor(row) : null;
  }
  async listAccessLinks(advisorId?:number) {
    const query = advisorId === undefined
      ? this.statement('SELECT * FROM access_links ORDER BY created_at DESC, id DESC LIMIT 100')
      : this.statement('SELECT * FROM access_links WHERE advisor_id = ? ORDER BY created_at DESC, id DESC LIMIT 100', [advisorId]);
    return (await query.all()).results.map(link);
  }
  async createAccessLink(input:{recipientName:string; recipientContact:string; validDays:number; maxOpens:number|null; createdBy:string; advisorId?:number|null}) {
    const expiresAt = new Date(Date.now() + input.validDays * 86400000).toISOString();
    const row = await this.statement('INSERT INTO access_links (token, advisor_id, recipient_name, recipient_contact, expires_at, max_opens, created_by) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *', [newToken(), input.advisorId ?? null, input.recipientName, input.recipientContact, expiresAt, input.maxOpens, input.createdBy]).first();
    if (!row) throw new Error('No fue posible crear el enlace.');
    return link(row);
  }
  async revokeAccessLink(id:number, advisorId?:number) {
    const statement = advisorId === undefined
      ? this.statement('UPDATE access_links SET revoked = 1 WHERE id = ? RETURNING *', [id])
      : this.statement('UPDATE access_links SET revoked = 1 WHERE id = ? AND advisor_id = ? RETURNING *', [id, advisorId]);
    const row = await statement.first();
    return row ? link(row) : null;
  }
  async openAccessLink(token:string) {
    const now = new Date().toISOString();
    // Eligibility and increment are atomic so concurrent opens cannot exceed the cap.
    const updated = await this.statement('UPDATE access_links SET open_count = open_count + 1, first_opened_at = COALESCE(first_opened_at, ?), last_opened_at = ? WHERE token = ? AND revoked = 0 AND expires_at > ? AND (max_opens IS NULL OR open_count < max_opens) RETURNING *', [now, now, token, now]).first();
    if (updated) return { status:'active' as const, link:link(updated) };
    const current = await this.peekAccessLink(token);
    if (!current) return { status:'missing' as const, link:null };
    if (current.revoked) return { status:'revoked' as const, link:current };
    if (new Date(current.expiresAt).getTime() <= Date.now()) return { status:'expired' as const, link:current };
    return { status:'limit' as const, link:current };
  }
  async peekAccessLink(token:string) {
    const row = await this.statement('SELECT * FROM access_links WHERE token = ? LIMIT 1', [token]).first();
    return row ? link(row) : null;
  }
}
