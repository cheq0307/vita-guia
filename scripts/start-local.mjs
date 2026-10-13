import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import mysql from "mysql2/promise";

const root = fileURLToPath(new URL("../", import.meta.url));
const envPath = join(root, ".env.local");

async function start() {
  if (!existsSync(envPath)) throw new Error("Copia .env.example como .env.local y configura tu acceso administrativo.");
  process.loadEnvFile(envPath);
  const port = Number(process.env.VITA_PORT || 8083);
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    throw new Error("Completa ADMIN_USERNAME, ADMIN_PASSWORD y ADMIN_SESSION_SECRET en .env.local.");
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("VITA_PORT debe ser un puerto entre 1024 y 65535.");
  const next = join(root, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(next)) throw new Error("Faltan las dependencias. Instala las del proyecto con npm install o pnpm install.");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    connectTimeout: 5000,
  }).catch(() => { throw new Error("No se pudo conectar con MySQL. Enciende MySQL en Laragon y revisa .env.local."); });
  await connection.end();
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () => reject(new Error(`El puerto ${port} ya esta ocupado. Usa la instancia abierta o cambia VITA_PORT.`)));
    probe.listen(port, "127.0.0.1", () => probe.close(resolve));
  });
  console.log(`Vita Guia local: http://127.0.0.1:${port}/admin`);
  console.log("La ventana debe permanecer abierta. Ctrl+C detiene la aplicacion.");
  const child = spawn(process.execPath, [next, "dev", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, stdio: "inherit" });
  child.once("error", () => { console.error("No se pudo iniciar Next.js."); process.exitCode = 1; });
  child.once("exit", code => { process.exitCode = code ?? 1; });
  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
}

start().catch(error => { console.error(error.message); process.exitCode = 1; });
