import { adminLibrary, type LibrarySearch } from '../../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Biblioteca | Vita Guía',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<LibrarySearch>}) {
  return adminLibrary((await params).section,await searchParams);
}
