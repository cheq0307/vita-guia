"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn } from "lucide-react";

export default function LoginForm({returnTo}:{returnTo:string}) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const passwordInput = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!retryAt) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (!remaining) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  async function submit(event:React.FormEvent) {
    event.preventDefault();
    if (submitting.current || secondsLeft > 0) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json() as { error?:unknown; retryAfter?:unknown };
      if (response.ok) {
        window.location.assign(returnTo);
        return;
      }
      if (response.status === 429) {
        const wait = Number(data.retryAfter ?? response.headers.get("Retry-After"));
        const seconds = Number.isFinite(wait) && wait > 0 ? Math.ceil(wait) : 30;
        setRetryAt(Date.now() + seconds * 1000);
        setSecondsLeft(seconds);
      } else {
        setError(typeof data.error === "string" ? data.error : "No pudimos iniciar sesión. Inténtalo de nuevo.");
        passwordInput.current?.focus();
      }
    } catch {
      setError("No pudimos conectarnos. Revisa tu conexión y vuelve a intentar.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }
  return <main className="signin-screen admin-login">
    <div className="brand-mark"><LockKeyhole size={22} aria-hidden="true" /></div>
    <p className="eyebrow">Acceso privado <span className="version-badge">v2</span></p>
    <h1>Panel de Vita Guía</h1>
    <p>Entra con tu correo y contraseña para administrar tu equipo y tus enlaces.</p>
    <form onSubmit={submit} aria-busy={loading}>
      <div className="login-field">
        <label htmlFor="login-email">Correo electrónico</label>
        <input id="login-email" name="username" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={(event) => setUsername(event.target.value)} />
      </div>
      <div className="login-field">
        <label htmlFor="login-password">Contraseña</label>
        <div className="login-password-field">
          <input ref={passwordInput} id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} aria-describedby={capsLock ? "login-caps-lock" : undefined} onChange={(event) => setPassword(event.target.value)} onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))} onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))} onBlur={() => setCapsLock(false)} />
          <button className="password-toggle" type="button" aria-controls="login-password" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      {capsLock && <p id="login-caps-lock" className="login-hint" role="status">Tienes activadas las mayúsculas.</p>}
      <button className="primary-button" type="submit" disabled={loading || secondsLeft > 0}>
        <LogIn size={18} aria-hidden="true" />{loading ? "Entrando…" : secondsLeft > 0 ? `Vuelve a intentar en ${secondsLeft} s` : "Entrar al panel"}
      </button>
      {secondsLeft > 0 && <p className="login-notice" role="status">Hubo varios intentos seguidos. Espera un momento; podrás volver a intentar aquí mismo.</p>}
      {error&&<p className="form-error" role="alert">{error}</p>}
    </form>
  </main>;
}
