import { advisorLibrary } from '../../../library-pages';
export const dynamic='force-dynamic';
export const metadata={title:'Biblioteca | Vita Guía',robots:{index:false,follow:false}};
export default async function AdvisorLibrary({params}:{params:Promise<{token:string}>}){return advisorLibrary((await params).token,'inicio');}
