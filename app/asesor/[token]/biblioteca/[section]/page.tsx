import { advisorLibrary, type LibrarySearch } from '../../../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Biblioteca | Vita Guía',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{token:string;section:string}>;searchParams:Promise<LibrarySearch>}) {
  const {token,section}=await params;
  return advisorLibrary(token,section,await searchParams);
}
