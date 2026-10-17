import {ArrowUpRight,Files,MessageCircle,PlayCircle,Users,ClipboardCheck,Eye,Link2,Home} from 'lucide-react';
import WorkspaceShell from './WorkspaceShell';
import {workspaceBase} from './navigation';
export default function WorkspaceMenu({advisorToken,mode='content'}:{advisorToken?:string;mode?:'content'|'more'}){
 const base=workspaceBase(advisorToken);
 const cards=advisorToken?[
  {title:'Mi espacio',detail:'Crear y compartir tus enlaces.',href:base,Icon:Home},
  {title:'Mis enlaces',detail:'Accesos que compartiste con tus clientes.',href:base+'/enlaces',Icon:Link2},
  {title:'Mis aportaciones',detail:'Tus borradores, envíos y comentarios de revisión.',href:base+'/aportaciones',Icon:ClipboardCheck},
  {title:'Documentos',detail:'Archivos que el administrador compartió contigo.',href:base+'/documentos',Icon:Files},
  {title:'Ver página',detail:'Explora la biblioteca de la comunidad.',href:base+'/biblioteca',Icon:Eye},
 ]:mode==='content'?[
  {title:'Documentos',detail:'Originales, versiones, productos y permisos.',href:'/admin/documentos',Icon:Files},
  {title:'Videos y enlaces',detail:'Archivos subidos y recursos de otras páginas.',href:'/admin/videos',Icon:PlayCircle},
  {title:'Historias de éxito',detail:'Experiencias escritas, imágenes y videos.',href:'/admin/historias',Icon:MessageCircle},
  {title:'Revisar aportaciones',detail:'Aprueba, pide cambios o rechaza los envíos.',href:'/admin/aportaciones',Icon:ClipboardCheck},
  {title:'Consulta interna',detail:'Busca información y revisa sus referencias.',href:'/admin/consulta',Icon:Files},
 ]:[
  {title:'Consulta interna',detail:'Información aprobada y referencias documentales.',href:'/admin/consulta',Icon:Files},
  {title:'Usuarios',detail:'Crear, activar y desactivar accesos personales.',href:'/admin/usuarios',Icon:Users},
  {title:'Contenido',detail:'Documentos, videos e historias.',href:'/admin/contenido',Icon:Files},
  {title:'Revisar aportaciones',detail:'Envíos pendientes de tu supervisión.',href:'/admin/aportaciones',Icon:ClipboardCheck},
  {title:'Ver página',detail:'Recorre lo que ve un cliente y vuelve al panel.',href:'/admin/biblioteca',Icon:Eye},
 ];
 return <WorkspaceShell advisorToken={advisorToken} title={mode==='more'?'Más opciones':'Gestionar contenido'} back={base}><div className="task-grid">{cards.map(({title,detail,href,Icon})=><a className="task-card" href={href} key={href}><Icon size={25} aria-hidden="true"/><div><h2>{title}</h2><p>{detail}</p></div><ArrowUpRight size={20} aria-hidden="true"/></a>)}</div>{advisorToken&&<p className="document-notice">Tu acceso es personal. Para tus clientes, crea y comparte un enlace de guía.</p>}</WorkspaceShell>;
}
