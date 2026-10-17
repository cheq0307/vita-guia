import {contributionsApi} from '../../contributions/api';
export const dynamic='force-dynamic';export const GET=(r:Request)=>contributionsApi(r);export const POST=(r:Request)=>contributionsApi(r);
