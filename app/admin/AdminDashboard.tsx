"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, Plus, RefreshCw, Search, ShieldCheck, Trash2, LogOut } from "lucide-react";

type LinkRecord = {
  id:number; token:string; recipientName:string; recipientContact:string; expiresAt:string;
  maxOpens:number|null; openCount:number; firstOpenedAt:string|null; lastOpenedAt:string|null; revoked:boolean; createdAt:string;
};

export default function AdminDashboard({ advisorToken, advisorName }: { advisorToken?:string; advisorName?:string } = {}) {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ recipientName:"", recipientContact:"", validDays:7, maxOpens:"" });
  const advisorHeaders: Record<string,string> = advisorToken ? { "x-advisor-token":advisorToken } : {};

  const loadLinks = async () => {
    setLoading(true); setError("");
    try { const response = await fetch("/api/links", { cache:"no-store", headers:advisorHeaders }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setLinks(data.links); }
    catch (e) { setError(e instanceof Error ? e.message : "No fue posible cargar los enlaces."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadLinks(); }, []);

  const visible = useMemo(() => links.filter((link) => `${link.recipientName} ${link.recipientContact}`.toLowerCase().includes(query.toLowerCase())), [links, query]);

  async function createLink(event: React.FormEvent) {
    event.preventDefault(); setCreating(true); setError("");
    try {
      const response = await fetch("/api/links", { method:"POST", headers:{ "content-type":"application/json", ...advisorHeaders }, body:JSON.stringify({ ...form, maxOpens:form.maxOpens ? Number(form.maxOpens) : null }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setLinks((current) => [data.link, ...current]); setForm({ recipientName:"", recipientContact:"", validDays:7, maxOpens:"" });
    } catch (e) { setError(e instanceof Error ? e.message : "No fue posible crear el enlace."); }
    finally { setCreating(false); }
  }

  async function copyLink(link: LinkRecord) {
    await navigator.clipboard.writeText(`${window.location.origin}/guia/${link.token}`); setCopied(link.id); window.setTimeout(() => setCopied(null), 1600);
  }

  async function revoke(id:number) {
    const response = await fetch(`/api/links/${id}`, { method:"PATCH", headers:advisorHeaders });
    if (response.ok) setLinks((current) => current.map((link) => link.id === id ? { ...link, revoked:true } : link));
  }

  async function logout() {
    await fetch("/api/auth/logout",{method:"POST"});
    window.location.assign("/login");
  }

  function status(link: LinkRecord) {
    if (link.revoked) return ["Revocado", "revoked"];
    if (new Date(link.expiresAt).getTime() < Date.now()) return ["Vencido", "expired"];
    return ["Activo", "active"];
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand admin-brand" href="/"><span className="brand-mark">V</span><span>Vita Guia</span></a>
        <nav><a className="selected" href={advisorToken ? `/asesor/${advisorToken}` : "/admin"}><Link2 size={18}/> Enlaces</a>{!advisorToken && <a href="/admin/usuarios"><ShieldCheck size={18}/> Usuarios</a>}<a href={advisorToken ? `/asesor/${advisorToken}/biblioteca` : "/admin/biblioteca"}><ShieldCheck size={18}/> Ver biblioteca</a></nav>
        {!advisorToken&&<button className="sidebar-logout" onClick={logout}><LogOut size={17}/> Cerrar sesion</button>}
        <p>Panel de distribucion</p>
      </aside>
      <section className="admin-main">
        <header className="admin-top"><div><p className="eyebrow">{advisorName ? `Usuario · ${advisorName}` : "Administracion"}</p><h1>Enlaces de clientes</h1></div><a className="library-link" href={advisorToken ? `/asesor/${advisorToken}/biblioteca` : "/admin/biblioteca"}>Vista de la biblioteca <span>→</span></a></header>

        <div className="admin-stats"><article><span>Enlaces activos</span><strong>{links.filter((x) => status(x)[1] === "active").length}</strong></article><article><span>Personas que ingresaron</span><strong>{links.filter((x) => x.firstOpenedAt).length}</strong></article><article><span>Aperturas totales</span><strong>{links.reduce((sum, x) => sum + x.openCount, 0)}</strong></article></div>

        <div className="admin-layout">
          <section className="create-panel"><div><h2>Crear un enlace</h2><p>Compártelo por WhatsApp, correo o el medio que prefieras.</p></div><form onSubmit={createLink}>
            <label>Nombre de la persona<input required value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName:e.target.value })} placeholder="Ej. Andrea Martinez" /></label>
            <label>Telefono o correo <span>Opcional</span><input value={form.recipientContact} onChange={(e) => setForm({ ...form, recipientContact:e.target.value })} placeholder="Para identificar el enlace" /></label>
            <div className="form-row"><label>Vigencia<select value={form.validDays} onChange={(e) => setForm({ ...form, validDays:Number(e.target.value) })}><option value={1}>1 dia</option><option value={3}>3 dias</option><option value={7}>7 dias</option><option value={14}>14 dias</option><option value={30}>30 dias</option></select></label><label>Limite de aperturas <span>Opcional</span><input type="number" min="1" max="100" value={form.maxOpens} onChange={(e) => setForm({ ...form, maxOpens:e.target.value })} placeholder="Sin limite" /></label></div>
            <button className="primary-button" disabled={creating}><Plus size={18}/>{creating ? "Creando..." : "Crear enlace"}</button>
            {error && <p className="form-error">{error}</p>}
          </form></section>

          <section className="links-panel"><header><div><h2>Enlaces recientes</h2><p>Solo registramos aperturas, no las secciones consultadas.</p></div><button className="icon-button" onClick={loadLinks} title="Actualizar"><RefreshCw size={17}/></button></header><div className="search-box"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o contacto" /></div>
            <div className="link-list">{loading ? <p className="empty-state">Cargando enlaces...</p> : visible.length === 0 ? <p className="empty-state">Aun no hay enlaces. Crea el primero desde el formulario.</p> : visible.map((link) => { const [label, kind] = status(link); return <article className="link-row" key={link.id}><div className="person-avatar">{link.recipientName.slice(0,1).toUpperCase()}</div><div className="link-person"><strong>{link.recipientName}</strong><span>{link.recipientContact || "Sin dato de contacto"}</span></div><div className="link-activity"><span className={`link-status ${kind}`}>{label}</span><small>{link.openCount === 0 ? "Sin aperturas" : `${link.openCount} ${link.openCount === 1 ? "apertura" : "aperturas"}`}</small></div><div className="row-actions"><button className="icon-button" onClick={() => copyLink(link)} title="Copiar enlace" disabled={kind !== "active"}>{copied === link.id ? <Check size={17}/> : <Copy size={17}/>}</button><button className="icon-button danger" onClick={() => revoke(link.id)} title="Revocar enlace" disabled={kind !== "active"}><Trash2 size={17}/></button></div></article>; })}</div>
          </section>
        </div>
      </section>
    </main>
  );
}
