import {contributionsApi} from '../../../contributions/api';
export const dynamic='force-dynamic';async function handler(r:Request,{params}:{params:Promise<{path:string[]}>}){return contributionsApi(r,(await params).path)}export const GET=handler;export const POST=handler;export const PUT=handler;export const PATCH=handler;export const DELETE=handler;
