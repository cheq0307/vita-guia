"use client";

import { useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";

export default function LoginForm({returnTo}:{returnTo:string}) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function submit(event:React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({username,password})});
    const data=await response.json();
    if(response.ok) window.location.assign(returnTo);
    else { setError(data.error??"No fue posible iniciar sesion."); setLoading(false); }
  }
  return <main className="signin-screen admin-login">
    <div className="brand-mark"><LockKeyhole size={22}/></div>
    <p className="eyebrow">Acceso privado</p>
    <h1>Panel de Vita Guia</h1>
    <p>Ingresa con la cuenta administrativa para gestionar usuarios y enlaces.</p>
    <form onSubmit={submit}>
      <label>Usuario<input autoComplete="username" required value={username} onChange={(event)=>setUsername(event.target.value)}/></label>
      <label>Contrasena<input type="password" autoComplete="current-password" required value={password} onChange={(event)=>setPassword(event.target.value)}/></label>
      <button className="primary-button" disabled={loading}><LogIn size={18}/>{loading?"Ingresando...":"Iniciar sesion"}</button>
      {error&&<p className="form-error" role="alert">{error}</p>}
    </form>
  </main>;
}
