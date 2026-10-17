import {storiesApi} from '../../stories/api';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>storiesApi(request);
export const POST=(request:Request)=>storiesApi(request);
