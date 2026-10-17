import {videosApi} from '../../../../../videos/api';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{token:string;id:string}>}){
 const {token,id}=await params;const url=new URL(request.url);url.searchParams.set('guide',token);url.searchParams.delete('advisor');
 return videosApi(new Request(url,{method:'GET',headers:request.headers}),['files',id]);
}
