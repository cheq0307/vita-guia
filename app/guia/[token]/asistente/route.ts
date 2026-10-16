import {assistantApi} from '../../../assistant/server';
export const dynamic='force-dynamic';
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){
 const url=new URL(request.url);url.searchParams.set('guide',(await params).token);url.searchParams.delete('advisor');
 return assistantApi(new Request(url,request));
}
