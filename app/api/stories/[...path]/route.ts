import {storiesApi} from '../../../stories/api';
export const dynamic='force-dynamic';
async function handler(request:Request,{params}:{params:Promise<{path:string[]}>}){return storiesApi(request,(await params).path)}
export const GET=handler;export const POST=handler;export const PUT=handler;export const PATCH=handler;export const DELETE=handler;
