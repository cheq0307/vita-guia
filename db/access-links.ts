import { repository } from './d1';
import type { VitaRepository } from './records';
export type { AccessLink } from './records';
export const listAccessLinks = (advisorId?:number) => repository().listAccessLinks(advisorId);
export const createAccessLink = (input:Parameters<VitaRepository['createAccessLink']>[0]) => repository().createAccessLink(input);
export const revokeAccessLink = (id:number, advisorId?:number) => repository().revokeAccessLink(id, advisorId);
export const openAccessLink = (token:string) => repository().openAccessLink(token);
export const peekAccessLink = (token:string) => repository().peekAccessLink(token);
