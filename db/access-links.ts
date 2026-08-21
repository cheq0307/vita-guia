import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { ensureDatabase, getPool, rows } from "./mysql";

export type AccessLink={id:number;token:string;advisorId:number|null;recipientName:string;recipientContact:string;expiresAt:string;maxOpens:number|null;openCount:number;firstOpenedAt:string|null;lastOpenedAt:string|null;revoked:boolean;createdAt:string};
type AccessLinkRow=RowDataPacket&Record<string,unknown>;

function mapRow(row:AccessLinkRow):AccessLink {
  return {id:Number(row.id),token:String(row.token),advisorId:row.advisor_id==null?null:Number(row.advisor_id),recipientName:String(row.recipient_name),recipientContact:String(row.recipient_contact??""),expiresAt:String(row.expires_at),maxOpens:row.max_opens==null?null:Number(row.max_opens),openCount:Number(row.open_count),firstOpenedAt:row.first_opened_at?String(row.first_opened_at):null,lastOpenedAt:row.last_opened_at?String(row.last_opened_at):null,revoked:Boolean(row.revoked),createdAt:String(row.created_at)};
}

export const ensureAccessSchema=ensureDatabase;

export async function listAccessLinks(advisorId?:number) {
  const result=advisorId?await rows<AccessLinkRow>("SELECT * FROM access_links WHERE advisor_id = ? ORDER BY created_at DESC, id DESC LIMIT 100",[advisorId]):await rows<AccessLinkRow>("SELECT * FROM access_links ORDER BY created_at DESC, id DESC LIMIT 100");
  return result.map(mapRow);
}

export async function createAccessLink(input:{recipientName:string;recipientContact:string;validDays:number;maxOpens:number|null;createdBy:string;advisorId?:number|null}) {
  await ensureDatabase();
  const token=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,12);
  const expiresAt=new Date(Date.now()+input.validDays*86400000).toISOString();
  const [result]=await getPool().execute<ResultSetHeader>(`INSERT INTO access_links (token, advisor_id, recipient_name, recipient_contact, expires_at, max_opens, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,[token,input.advisorId??null,input.recipientName,input.recipientContact,expiresAt,input.maxOpens,input.createdBy]);
  const [row]=await rows<AccessLinkRow>("SELECT * FROM access_links WHERE id = ?",[result.insertId]);
  return mapRow(row);
}

export async function revokeAccessLink(id:number,advisorId?:number) {
  await ensureDatabase();
  const query=advisorId?"UPDATE access_links SET revoked = 1 WHERE id = ? AND advisor_id = ?":"UPDATE access_links SET revoked = 1 WHERE id = ?";
  const values=advisorId?[id,advisorId]:[id];
  const [result]=await getPool().execute<ResultSetHeader>(query,values);
  if(!result.affectedRows)return null;
  const [row]=await rows<AccessLinkRow>("SELECT * FROM access_links WHERE id = ?",[id]);
  return row?mapRow(row):null;
}

export async function openAccessLink(token:string) {
  const [row]=await rows<AccessLinkRow>("SELECT * FROM access_links WHERE token = ? LIMIT 1",[token]);
  if(!row)return {status:"missing" as const,link:null};
  const link=mapRow(row);
  if(link.revoked)return {status:"revoked" as const,link};
  if(new Date(link.expiresAt).getTime()<=Date.now())return {status:"expired" as const,link};
  if(link.maxOpens!==null&&link.openCount>=link.maxOpens)return {status:"limit" as const,link};
  const now=new Date().toISOString();
  await getPool().execute("UPDATE access_links SET open_count = open_count + 1, first_opened_at = COALESCE(first_opened_at, ?), last_opened_at = ? WHERE id = ?",[now,now,link.id]);
  const [updated]=await rows<AccessLinkRow>("SELECT * FROM access_links WHERE id = ?",[link.id]);
  return {status:"active" as const,link:mapRow(updated)};
}

export async function peekAccessLink(token:string) {
  const [row]=await rows<AccessLinkRow>("SELECT * FROM access_links WHERE token = ? LIMIT 1",[token]);
  return row?mapRow(row):null;
}
