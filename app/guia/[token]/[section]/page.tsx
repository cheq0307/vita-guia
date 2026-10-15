import { customerLibrary, type LibrarySearch } from '../../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Tu biblioteca | Vita Guía',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{token:string;section:string}>;searchParams:Promise<LibrarySearch>}) {
  const {token,section}=await params;
  return customerLibrary(token,section,await searchParams);
}
