import {videosApi} from '../../videos/api';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>videosApi(request);
export const POST=(request:Request)=>videosApi(request);
