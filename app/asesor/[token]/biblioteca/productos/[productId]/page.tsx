import { advisorLibrary, type LibrarySearch } from '../../../../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Producto | Vita Guía',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{token:string;productId:string}>;searchParams:Promise<LibrarySearch>}) {
  const {token,productId}=await params;
  return advisorLibrary(token,'productos',await searchParams,productId);
}
