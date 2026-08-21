import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { ensureDatabase, getPool, rows } from "./mysql";

export type Advisor = { id:number; name:string; contact:string; token:string; active:boolean; createdAt:string };
type AdvisorRow = RowDataPacket & { id:number; name:string; contact:string; token:string; active:number; created_at:string };

function mapRow(row:AdvisorRow):Advisor {
  return { id:Number(row.id), name:String(row.name), contact:String(row.contact??""), token:String(row.token), active:Boolean(row.active), createdAt:String(row.created_at) };
}

export const ensureAdvisorSchema=ensureDatabase;

export async function listAdvisors() {
  return (await rows<AdvisorRow>("SELECT * FROM advisors ORDER BY created_at DESC, id DESC")).map(mapRow);
}

export async function createAdvisor(name:string,contact:string) {
  await ensureDatabase();
  const token=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,12);
  const [result]=await getPool().execute<ResultSetHeader>("INSERT INTO advisors (name, contact, token) VALUES (?, ?, ?)",[name,contact,token]);
  const [row]=await rows<AdvisorRow>("SELECT * FROM advisors WHERE id = ?",[result.insertId]);
  return mapRow(row);
}

export async function findAdvisorByToken(token:string) {
  const [row]=await rows<AdvisorRow>("SELECT * FROM advisors WHERE token = ? AND active = 1 LIMIT 1",[token]);
  return row?mapRow(row):null;
}

export async function toggleAdvisor(id:number) {
  await ensureDatabase();
  await getPool().execute("UPDATE advisors SET active = IF(active = 1, 0, 1) WHERE id = ?",[id]);
  const [row]=await rows<AdvisorRow>("SELECT * FROM advisors WHERE id = ?",[id]);
  return row?mapRow(row):null;
}
