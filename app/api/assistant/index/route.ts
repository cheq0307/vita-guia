import {assistantApi} from '../../../assistant/server';
export const dynamic='force-dynamic';
export const POST=(request:Request)=>assistantApi(request,true);
