import { access, mkdir, mkdtemp, readdir, rename, rmdir, stat, unlink, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
if (existsSync(join(root, ".env.local"))) process.loadEnvFile(join(root, ".env.local"));

async function findDump() {
  if (process.env.MYSQL_DUMP_PATH) {
    await access(process.env.MYSQL_DUMP_PATH);
    return process.env.MYSQL_DUMP_PATH;
  }
  for (const home of [process.env.LARAGON_HOME, "C:/laragon", "C:/ARchivosYooo/Programas/laragon"].filter(Boolean)) {
    const versions = await readdir(join(home, "bin", "mysql")).catch(() => []);
    for (const version of versions.sort().reverse()) {
      const candidate = join(home, "bin", "mysql", version, "bin", "mysqldump.exe");
      if (existsSync(candidate)) return candidate;
    }
  }
  throw new Error("Configura MYSQL_DUMP_PATH con la ruta de mysqldump de tu instalacion de MySQL.");
}

function run(executable, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(executable, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", data => { output += data; });
    // Errors may include connection details; report the status without echoing credentials.
    child.stderr.resume();
    child.once("error", () => reject(new Error("No se pudo ejecutar mysqldump.")));
    child.once("exit", code => code === 0 ? resolveRun(output) : reject(new Error(`mysqldump termino con codigo ${code}. Revisa MySQL y .env.local.`)));
  });
}

const optionValue = value => '"' + String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n").replaceAll("\r", "\\r") + '"';

async function backup() {
  const database = process.env.MYSQL_DATABASE;
  if (!database || !/^[a-zA-Z0-9_]+$/.test(database)) throw new Error("Configura un MYSQL_DATABASE valido en .env.local.");
  const executable = await findDump();
  const version = await run(executable, ["--version"]);
  const directory = resolve(process.env.VITA_BACKUP_DIR || join(root, "backups"));
  await mkdir(directory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-");
  const filename = `${database}-${stamp}-${randomUUID().slice(0, 8)}.sql`;
  const target = join(directory, filename);
  const partial = target + ".partial";
  const privateDirectory = await mkdtemp(join(tmpdir(), "vita-guia-backup-"));
  const optionsPath = join(privateDirectory, "client.cnf");
  try {
    await writeFile(optionsPath, ["[client]", `host=${optionValue(process.env.MYSQL_HOST || "127.0.0.1")}`, `port=${Number(process.env.MYSQL_PORT || 3306)}`, `user=${optionValue(process.env.MYSQL_USER || "root")}`, `password=${optionValue(process.env.MYSQL_PASSWORD || "")}`, ""].join("\n"), { mode: 0o600, flag: "wx" });
    const args = [`--defaults-extra-file=${optionsPath}`, "--single-transaction", "--skip-lock-tables", "--no-tablespaces", "--default-character-set=utf8mb4", `--result-file=${partial}`];
    if (!/mariadb/i.test(version)) args.push("--column-statistics=0", "--set-gtid-purged=OFF");
    args.push(database);
    await run(executable, args);
    if (!(await stat(partial)).size) throw new Error("El respaldo esta vacio; no se guardo como un respaldo completo.");
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(partial)) hash.update(chunk);
    await rename(partial, target);
    await writeFile(target + ".json", JSON.stringify({ database, createdAt: new Date().toISOString(), sqlFile: filename, sha256: hash.digest("hex"), dumpVersion: version.trim() }, null, 2) + "\n", { flag: "wx" });
    console.log(`Respaldo completo: ${target}`);
    console.log("Incluye estructura y registros. Guarda otra copia fuera de esta PC; no lo subas a Git.");
  } finally {
    await unlink(optionsPath).catch(error => { if (error.code !== "ENOENT") throw error; });
    await rmdir(privateDirectory);
    await unlink(partial).catch(error => { if (error.code !== "ENOENT") throw error; });
  }
}

backup().catch(error => { console.error(error.message); process.exitCode = 1; });
