import {guideDocuments} from '../../../../documents/guide';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{token:string;path:string[]}>}){const {token,path}=await params;return guideDocuments(request,token,path)}
