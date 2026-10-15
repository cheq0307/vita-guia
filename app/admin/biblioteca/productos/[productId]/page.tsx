import { adminLibrary, type LibrarySearch } from '../../../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Producto | Vita Guía',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{productId:string}>;searchParams:Promise<LibrarySearch>}) {
  const {productId}=await params;
  return adminLibrary('productos',await searchParams,productId);
}
