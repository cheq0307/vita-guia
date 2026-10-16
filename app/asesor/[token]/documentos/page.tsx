import {findAdvisorByToken} from '../../../../db/advisors';
import DocumentLibrary from '../../../documents/DocumentLibrary';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!await findAdvisorByToken(token))notFound();return <DocumentLibrary advisorToken={token}/>}
