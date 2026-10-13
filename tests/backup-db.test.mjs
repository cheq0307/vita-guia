import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { promisify } from "node:util";
import mysql from "mysql2/promise";

test("database backup restores text, relations and its checksum into an isolated database", {
  skip: process.env.VITA_BACKUP_TEST !== "1",
}, async () => {
  assert.ok(["localhost", "127.0.0.1"].includes(process.env.MYSQL_HOST || "127.0.0.1"));
  const root = fileURLToPath(new URL("../", import.meta.url));
  await mkdir(join(root, "outputs"), { recursive: true });
  const output = await mkdtemp(join(root, "outputs", "backup-check-"));
  const suffix = randomUUID().replaceAll("-", "");
  const source = `vita_backup_test_${suffix}`;
  const target = `vita_backup_test_restore_${suffix}`;
  const config = { host: process.env.MYSQL_HOST || "127.0.0.1", port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER || "root", password: process.env.MYSQL_PASSWORD || "" };
  const connection = await mysql.createConnection(config);
  let restored;
  try {
    for (const database of [source, target]) await connection.query("CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", [database]);
    await connection.query("CREATE TABLE ??.parents (id INT PRIMARY KEY, name VARCHAR(190)) ENGINE=InnoDB", [source]);
    await connection.query("CREATE TABLE ??.notes (id INT PRIMARY KEY, parent_id INT, body TEXT, FOREIGN KEY (parent_id) REFERENCES parents(id)) ENGINE=InnoDB", [source]);
    const text = "Guía de prueba: 'comillas', \\ y salto\nde línea — ñ 😀";
    await connection.query("INSERT INTO ??.parents VALUES (?, ?)", [source, 7, "Prueba de respaldo"]);
    await connection.query("INSERT INTO ??.notes VALUES (?, ?, ?)", [source, 9, 7, text]);
    await promisify(execFile)(process.execPath, [join(root, "scripts", "backup-db.mjs")], {
      cwd: root,
      env: { ...process.env, MYSQL_DATABASE: source, VITA_BACKUP_DIR: output },
    });
    const files = await readdir(output);
    const sqlFile = files.find(name => name.endsWith(".sql"));
    assert.ok(sqlFile);
    const sql = await readFile(join(output, sqlFile));
    const metadata = JSON.parse(await readFile(join(output, sqlFile + ".json"), "utf8"));
    assert.equal(metadata.database, source);
    assert.equal(metadata.sha256, createHash("sha256").update(sql).digest("hex"));
    assert.ok(!files.some(name => name.endsWith(".partial")));
    restored = await mysql.createConnection({ ...config, database: target, multipleStatements: true });
    await restored.query(sql.toString("utf8"));
    const [rows] = await restored.query("SELECT notes.id, parent_id, body, name FROM notes JOIN parents ON parents.id = notes.parent_id");
    assert.deepEqual(rows.map(row => ({ ...row })), [{ id: 9, parent_id: 7, body: text, name: "Prueba de respaldo" }]);
  } finally {
    await restored?.end();
    for (const database of [target, source]) {
      assert.ok(database.startsWith("vita_backup_test_") && database !== process.env.MYSQL_DATABASE);
      await connection.query("DROP DATABASE IF EXISTS ??", [database]);
    }
    await connection.end();
  }
});
