import {findAdvisorByToken} from '../../../../../db/advisors';
import DocumentDetail from '../../../../documents/DocumentDetail';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{token:string;id:string}>}){const {token,id}=await params;if(!await findAdvisorByToken(token))notFound();return <DocumentDetail id={id} advisorToken={token}/>}
