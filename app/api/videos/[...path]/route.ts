import {videosApi} from '../../../videos/api';
export const dynamic='force-dynamic';
type Context={params:Promise<{path:string[]}>};
async function handler(request:Request,{params}:Context){return videosApi(request,(await params).path)}
export const GET=handler;
export const POST=handler;
export const PUT=handler;
export const PATCH=handler;
