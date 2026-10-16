import {requireAdminPage} from '../../../admin-session';
import DocumentDetail from '../../../documents/DocumentDetail';
export const dynamic='force-dynamic';
export const metadata={title:'Documento | Vita Guía',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;await requireAdminPage('/admin/documentos/'+encodeURIComponent(id));return <DocumentDetail id={id}/>}
