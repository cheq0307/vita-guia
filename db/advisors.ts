import { repository } from './d1';
export type { Advisor } from './records';
export const listAdvisors = () => repository().listAdvisors();
export const createAdvisor = (name:string, contact:string) => repository().createAdvisor(name, contact);
export const findAdvisorByToken = (token:string) => repository().findAdvisorByToken(token);
export const toggleAdvisor = (id:number) => repository().toggleAdvisor(id);
