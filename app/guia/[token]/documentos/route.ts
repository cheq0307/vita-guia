import {guideDocuments} from '../../../documents/guide';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{token:string}>}){return guideDocuments(request,(await params).token)}
