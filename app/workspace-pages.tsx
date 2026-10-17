import {notFound} from 'next/navigation';
import {requireAdminPage} from './admin-session';
import {findAdvisorByToken} from '../db/advisors';
import AdminDashboard from './admin/AdminDashboard';
import WorkspaceMenu from './ui/WorkspaceMenu';
export async function workspacePage(view:'links'|'content'|'more',token?:string){
 if(token){if(!await findAdvisorByToken(token))notFound()}else await requireAdminPage('/admin/'+({links:'enlaces',content:'contenido',more:'mas'}[view]));
 return view==='links'?<AdminDashboard advisorToken={token} view="links"/>:<WorkspaceMenu advisorToken={token} mode={view==='more'?'more':'content'}/>;
}
