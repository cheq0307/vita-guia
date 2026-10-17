import {requireAdminPage} from '../../admin-session';
import InternalKnowledge from '../../assistant/InternalKnowledge';
export const dynamic='force-dynamic';
export default async function Page(){await requireAdminPage('/admin/consulta');return <InternalKnowledge/>}
