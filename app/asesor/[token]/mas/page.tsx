import {workspacePage} from '../../../workspace-pages';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{token:string}>}){return workspacePage('more',(await params).token)}
