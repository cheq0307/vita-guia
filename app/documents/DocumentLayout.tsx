import type {ReactNode} from 'react';
import WorkspaceShell from '../ui/WorkspaceShell';
import {workspaceBase} from '../ui/navigation';
export default function DocumentLayout({children,advisorToken,title,actions,back,pageHref}:{children:ReactNode;advisorToken?:string;title:string;actions?:ReactNode;active?:'documents'|'stories'|'contributions';back?:string;pageHref?:string}){
 return <WorkspaceShell title={title} advisorToken={advisorToken} actions={actions} pageHref={pageHref} back={back??workspaceBase(advisorToken)}>{children}</WorkspaceShell>;
}
