"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, Plus, ShieldCheck, UserRound, UserRoundCheck, UserRoundX } from "lucide-react";

type Advisor={id:number;name:string;contact:string;token:string;active:boolean;createdAt:string};

export default function UserManager(){
  const [advisors,setAdvisors]=useState<Advisor[]>([]);
  const [form,setForm]=useState({name:"",contact:""});
  const [loading,setLoading]=useState(true);
  const [creating,setCreating]=useState(false);
  const [copied,setCopied]=useState<number|null>(null);
  const [error,setError]=useState("");

  async function load(){setLoading(true);const response=await fetch("/api/advisors",{cache:"no-store"});const data=await response.json();if(response.ok)setAdvisors(data.advisors);else setError(data.error);setLoading(false)}
  useEffect(()=>{void load()},[]);

  async function create(event:React.FormEvent){event.preventDefault();setCreating(true);setError("");const response=await fetch("/api/advisors",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});const data=await response.json();if(response.ok){setAdvisors((items)=>[data.advisor,...items]);setForm({name:"",contact:""})}else setError(data.error);setCreating(false)}
  async function toggle(id:number){const response=await fetch(`/api/advisors/${id}`,{method:"PATCH"});if(response.ok){const data=await response.json();setAdvisors((items)=>items.map((item)=>item.id===id?data.advisor:item))}}
  async function copy(advisor:Advisor){await navigator.clipboard.writeText(`${window.location.origin}/asesor/${advisor.token}`);setCopied(advisor.id);window.setTimeout(()=>setCopied(null),1600)}

  return <main className="admin-shell"><aside className="admin-sidebar"><a className="brand admin-brand" href="/"><span className="brand-mark">V</span><span>Vita Guia</span></a><nav><a href="/admin"><Link2 size={18}/> Enlaces</a><a className="selected" href="/admin/usuarios"><UserRound size={18}/> Usuarios</a><a href="/"><ShieldCheck size={18}/> Ver biblioteca</a></nav><p>Panel de administracion</p></aside><section className="admin-main"><header className="admin-top"><div><p className="eyebrow">Administracion</p><h1>Usuarios que comparten</h1></div></header><div className="admin-layout users-layout"><section className="create-panel"><div><h2>Crear usuario</h2><p>El usuario recibira un acceso propio para generar enlaces de clientes.</p></div><form onSubmit={create}><label>Nombre<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Ej. Laura Hernandez"/></label><label>Telefono o correo <span>Opcional</span><input value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} placeholder="Para identificarlo"/></label><button className="primary-button" disabled={creating}><Plus size={18}/>{creating?"Creando...":"Crear usuario"}</button>{error&&<p className="form-error">{error}</p>}</form></section><section className="links-panel"><header><div><h2>Usuarios registrados</h2><p>Cada uno administra solamente los enlaces que comparte.</p></div></header><div className="link-list advisor-list">{loading?<p className="empty-state">Cargando usuarios...</p>:advisors.length===0?<p className="empty-state">Aun no hay usuarios registrados.</p>:advisors.map((advisor)=><article className="link-row advisor-row" key={advisor.id}><div className="person-avatar">{advisor.name.slice(0,1).toUpperCase()}</div><div className="link-person"><strong>{advisor.name}</strong><span>{advisor.contact||"Sin dato de contacto"}</span></div><div className="link-activity"><span className={`link-status ${advisor.active?"active":"revoked"}`}>{advisor.active?"Activo":"Desactivado"}</span><small>Puede compartir enlaces</small></div><div className="row-actions"><button className="icon-button" onClick={()=>copy(advisor)} title="Copiar acceso del usuario" disabled={!advisor.active}>{copied===advisor.id?<Check size={17}/>:<Copy size={17}/>}</button><button className="icon-button danger" onClick={()=>toggle(advisor.id)} title={advisor.active?"Desactivar usuario":"Activar usuario"}>{advisor.active?<UserRoundX size={17}/>:<UserRoundCheck size={17}/>}</button></div></article>)}</div></section></div></section></main>
}
