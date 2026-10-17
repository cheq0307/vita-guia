export type ContributionInput={kind:'story'|'document';title:string;author:string;body:string;period:string;products:string[];category:string;permission:boolean};
export type ReviewState='draft'|'pending'|'changes_requested'|'rejected'|'approved';
export type ContributionFile={id:string;contribution_id:string;kind:'image'|'video'|'document'|'link';file_id:string|null;url:string|null;filename:string;caption:string;state:string|null;size:number|null;mime:string|null;removed:number};
export type Contribution=ContributionInput&{id:string;advisor_id:number;advisor_name:string;state:ReviewState;review_note:string;output_id:string|null;page_count:number;text_status:string;created_at:string;files:ContributionFile[]};
export type ContributionPage={items:Contribution[];total:number;pages:number;page:number};
export const reviewLabels:Record<ReviewState,string>={draft:'Borrador',pending:'En revisión',changes_requested:'Cambios solicitados',rejected:'No aprobado',approved:'Aprobado'};
export function contributionFileHref(id:string,token?:string){return '/api/contributions/files/'+encodeURIComponent(id)+(token?'?advisor='+encodeURIComponent(token):'')}
