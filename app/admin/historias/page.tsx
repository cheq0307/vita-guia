import {requireAdminPage} from '../../admin-session';
import StoryManager from '../../stories/StoryManager';
export const dynamic='force-dynamic';
export const metadata={title:'Historias de éxito | Vita Guía',robots:{index:false,follow:false}};
export default async function Page(){await requireAdminPage('/admin/historias');return <StoryManager/>}
