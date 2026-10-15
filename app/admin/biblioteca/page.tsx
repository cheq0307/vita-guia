import { adminLibrary } from '../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Biblioteca | Vita Guía',robots:{index:false,follow:false}};
export default async function AdminLibrary(){return adminLibrary('inicio');}
