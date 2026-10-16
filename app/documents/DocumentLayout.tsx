'use client';
import {Link2,UserRound,Files,Eye} from 'lucide-react';
import LogoutButton from '../LogoutButton';
export default function DocumentLayout({children,advisorToken,title,actions}:{children:React.ReactNode;advisorToken?:string;title:string;actions?:React.ReactNode}){
 const base=advisorToken?'/asesor/'+encodeURIComponent(advisorToken):'/admin';
 return <main className="admin-shell"><aside className="admin-sidebar"><a className="brand admin-brand" href={base}><span className="brand-mark">V</span><span>Vita Guía</span></a><nav><a href={base}><Link2 size={18}/>Enlaces</a>{!advisorToken&&<a href="/admin/usuarios"><UserRound size={18}/>Usuarios</a>}<a className="selected" href={base+'/documentos'} aria-current="page"><Files size={18}/>Documentos</a><a href={base+'/biblioteca'}><Eye size={18}/>Ver página</a></nav><p>Tu biblioteca de fuentes</p></aside><section className="admin-main document-main"><header className="admin-top"><div><p className="eyebrow">Biblioteca virtual</p><h1>{title}</h1></div><div className="workspace-actions">{actions}{!advisorToken&&<LogoutButton/>}</div></header>{children}</section></main>;
}
