"use client";

import { useState } from "react";

const products = [
  { name: "Fibras +", category: "Bienestar digestivo", dose: "1 medida", time: "8:00 AM", tone: "coral" },
  { name: "Vita Daily", category: "Nutricion diaria", dose: "2 capsulas", time: "2:00 PM", tone: "green" },
  { name: "Calm Night", category: "Rutina nocturna", dose: "1 sobre", time: "9:30 PM", tone: "blue" },
];

function answerQuestion(question: string) {
  const value = question.toLowerCase();
  if (value.includes("fibra") || value.includes("prepar")) return "Mezcla 1 medida de Fibras + en un vaso con agua y tomala a las 8:00 AM. Sigue siempre las indicaciones incluidas con el producto.";
  if (value.includes("vita") || value.includes("capsula") || value.includes("hora")) return "La guia indica 2 capsulas de Vita Daily a las 2:00 PM.";
  if (value.includes("calm") || value.includes("noche") || value.includes("dorm")) return "Calm Night se integra a la rutina nocturna: 1 sobre a las 9:30 PM.";
  return "No encuentro esa respuesta en la informacion de esta guia. Consulta directamente con la persona que te compartio el enlace.";
}

export function ClientPortal({ recipientName = "", expiresAt }: { recipientName?: string; expiresAt?: string } = {}) {
  const [active, setActive] = useState("inicio");
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const expiryLabel = expiresAt ? new Intl.DateTimeFormat("es-MX", { day:"numeric", month:"long" }).format(new Date(expiresAt)) : "7 dias";

  function goTo(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function ask(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setMessages((current) => [...current, clean, answerQuestion(clean)]);
    setQuestion("");
  }

  return (
    <main className="portal-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Vita Guia inicio"><span className="brand-mark">V</span><span>Vita Guia</span></a>
        <div className="access-status"><span className="status-dot" /> Acceso privado</div>
      </header>

      <nav className="section-nav" aria-label="Secciones principales">
        {[["inicio", "Inicio"], ["productos", "Productos"], ["videos", "Videos"], ["historias", "Historias"]].map(([id, label]) => (
          <button key={id} className={active === id ? "active" : ""} onClick={() => goTo(id)}>{label}</button>
        ))}
      </nav>

      <section className="welcome-band" id="inicio">
        <div><p className="eyebrow">{recipientName ? `Hola, ${recipientName}` : "Tu guia personal"}</p><h1>Todo lo que necesitas para comenzar con confianza.</h1><p className="intro">Consulta tu rutina, aprende a usar cada producto y resuelve tus dudas a tu ritmo.</p></div>
        <div className="access-note"><span>Enlace activo</span><strong>{expiresAt ? `Disponible hasta el ${expiryLabel}` : `Disponible por ${expiryLabel}`}</strong><small>Puedes volver mientras el enlace siga activo</small></div>
      </section>

      <section className="content-wrap" id="productos">
        <div className="section-heading"><div><p className="eyebrow">Tu rutina</p><h2>Productos recomendados</h2></div><span className="count">3 productos</span></div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.name}>
              <div className={`product-visual ${product.tone}`} aria-hidden="true"><span className="bottle-cap" /><span className="bottle-body"><b>VITA</b><i>{String(index + 1).padStart(2, "0")}</i></span></div>
              <div className="product-copy"><p>{product.category}</p><h3>{product.name}</h3><dl><div><dt>Cantidad</dt><dd>{product.dose}</dd></div><div><dt>Horario</dt><dd>{product.time}</dd></div></dl><button className="text-action">Ver indicaciones <span aria-hidden="true">→</span></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="media-band" id="videos">
        <div className="section-heading light"><div><p className="eyebrow">Paso a paso</p><h2>Aprende en pocos minutos</h2></div><button className="view-all">Ver todos</button></div>
        <div className="video-grid">
          <article className="video-feature"><div className="play"><span>▶</span></div><div><span>04:18</span><h3>Como organizar tu rutina diaria</h3><p>Una guia simple para integrar tus productos sin complicaciones.</p></div></article>
          <article className="video-small"><div className="mini-thumb mint"><span>▶</span></div><div><span>02:45</span><h3>Prepara Fibras +</h3><p>Textura, cantidad y mejor momento.</p></div></article>
          <article className="video-small"><div className="mini-thumb peach"><span>▶</span></div><div><span>03:10</span><h3>Preguntas frecuentes</h3><p>Respuestas antes de comenzar.</p></div></article>
        </div>
      </section>

      <section className="stories" id="historias">
        <div><p className="eyebrow">Experiencias reales</p><h2>Historias que acompañan</h2><p>Conoce como otras personas incorporaron una rutina de bienestar a su dia a dia.</p></div>
        <article className="story-card"><div className="portrait-placeholder"><span>▶</span></div><div><blockquote>“Tener toda la informacion en un solo lugar me ayudo a ser constante.”</blockquote><p>Mariana · 8 semanas</p></div></article>
      </section>

      <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)} aria-expanded={chatOpen} aria-label="Abrir asistente de preguntas"><span>?</span><b>Pregunta sobre tus productos</b></button>
      {chatOpen && <aside className="chat-panel"><header><div><strong>Asistente Vita</strong><small>Responde con la informacion de esta guia</small></div><button onClick={() => setChatOpen(false)} aria-label="Cerrar">×</button></header><div className="chat-body"><p className="bot-message">Hola, puedo ayudarte con el uso, horario e indicaciones de los productos incluidos en esta guia.</p>{messages.map((message, index) => <p key={`${message}-${index}`} className={index % 2 === 0 ? "user-message" : "bot-message"}>{message}</p>)}{messages.length === 0 && <div className="quick-questions"><button onClick={() => ask("¿Como preparo Fibras +?")}>¿Como preparo Fibras +?</button><button onClick={() => ask("¿A que hora tomo Vita Daily?")}>¿A que hora tomo Vita Daily?</button></div>}</div><form onSubmit={(e) => { e.preventDefault(); ask(question); }}><input value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta..." /><button aria-label="Enviar pregunta">↑</button></form></aside>}

      <footer><span>Vita Guia</span><p>La informacion de esta guia no sustituye la orientacion de un profesional de la salud.</p></footer>
    </main>
  );
}

export default function Home() {
  return <main className="access-screen public-gate"><div className="brand-mark">V</div><p className="eyebrow">Vita Guia</p><h1>Tu informacion comienza con un enlace.</h1><p>Abre el enlace que te compartio tu asesor para consultar productos, videos y respuestas durante el tiempo disponible.</p><a className="admin-entry" href="/admin">Acceso administrativo</a></main>;
}
