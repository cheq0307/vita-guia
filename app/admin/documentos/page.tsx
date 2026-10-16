import {requireAdminPage} from '../../admin-session';
import DocumentLibrary from '../../documents/DocumentLibrary';
export const dynamic='force-dynamic';
export const metadata={title:'Documentos y fuentes | Vita Guía',robots:{index:false,follow:false}};
export default async function Page(){await requireAdminPage('/admin/documentos');return <DocumentLibrary/>}
