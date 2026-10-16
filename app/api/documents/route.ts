import {documentsApi} from '../../documents/api';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>documentsApi(request);
export const POST=(request:Request)=>documentsApi(request);
