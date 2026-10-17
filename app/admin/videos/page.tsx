import {requireAdminPage} from '../../admin-session';
import VideoManager from '../../videos/VideoManager';
export const dynamic='force-dynamic';
export const metadata={title:'Videos y enlaces | Vita Guía',robots:{index:false,follow:false}};
export default async function Page(){await requireAdminPage('/admin/videos');return <VideoManager/>}
