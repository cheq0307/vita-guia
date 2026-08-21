import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

const database = process.env.MYSQL_DATABASE || "vita_guia";
if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error("MYSQL_DATABASE solo puede contener letras, numeros y guion bajo.");

const connection = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
};

declare global {
  var vitaGuiaPool: Pool | undefined;
  var vitaGuiaSchemaPromise: Promise<void> | undefined;
}

export function getPool() {
  globalThis.vitaGuiaPool ??= mysql.createPool({ ...connection, database, waitForConnections:true, connectionLimit:10, dateStrings:true, charset:"utf8mb4" });
  return globalThis.vitaGuiaPool;
}

export async function ensureDatabase() {
  globalThis.vitaGuiaSchemaPromise ??= (async () => {
    const bootstrap = await mysql.createConnection(connection);
    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await bootstrap.end();
    const pool = getPool();
    await pool.query(`CREATE TABLE IF NOT EXISTS advisors (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL,
      contact VARCHAR(190) NOT NULL DEFAULT '', token VARCHAR(96) NOT NULL UNIQUE,
      active TINYINT(1) NOT NULL DEFAULT 1, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await pool.query(`CREATE TABLE IF NOT EXISTS access_links (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, token VARCHAR(96) NOT NULL UNIQUE,
      advisor_id INT UNSIGNED NULL, recipient_name VARCHAR(160) NOT NULL,
      recipient_contact VARCHAR(190) NOT NULL DEFAULT '', expires_at VARCHAR(35) NOT NULL,
      max_opens INT UNSIGNED NULL, open_count INT UNSIGNED NOT NULL DEFAULT 0,
      first_opened_at VARCHAR(35) NULL, last_opened_at VARCHAR(35) NULL,
      revoked TINYINT(1) NOT NULL DEFAULT 0, created_by VARCHAR(190) NOT NULL DEFAULT 'local-admin',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_access_links_expires_at (expires_at), INDEX idx_access_links_advisor_id (advisor_id),
      CONSTRAINT fk_access_links_advisor FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  })().catch((error) => {
    globalThis.vitaGuiaSchemaPromise = undefined;
    throw new Error(`No se pudo conectar con MariaDB. Enciende MySQL en XAMPP y revisa .env.local. ${error instanceof Error ? error.message : ""}`);
  });
  return globalThis.vitaGuiaSchemaPromise;
}

export async function rows<T extends RowDataPacket>(sql:string, values:Array<string|number|null> = []) {
  await ensureDatabase();
  const [result] = await getPool().execute<T[]>(sql, values);
  return result;
}
