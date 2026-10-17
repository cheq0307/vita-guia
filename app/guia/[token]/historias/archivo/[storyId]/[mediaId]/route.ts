import {storiesApi} from '../../../../../../stories/api';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{token:string;storyId:string;mediaId:string}>}){const {token,storyId,mediaId}=await params;const url=new URL(request.url);url.searchParams.set('guide',token);url.searchParams.delete('advisor');return storiesApi(new Request(url,{method:'GET',headers:request.headers}),['files',storyId,mediaId])}
