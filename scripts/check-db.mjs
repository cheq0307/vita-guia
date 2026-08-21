import mysql from "mysql2/promise";

const config={host:process.env.MYSQL_HOST||"127.0.0.1",port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER||"root",password:process.env.MYSQL_PASSWORD||""};
try {
  const connection=await mysql.createConnection(config);
  const [rows]=await connection.query("SELECT VERSION() AS version");
  console.log(`MariaDB disponible: ${rows[0].version}`);
  await connection.end();
} catch(error) {
  console.error("No se pudo conectar. Enciende MySQL desde XAMPP y revisa .env.local.");
  console.error(error instanceof Error?error.message:error);
  process.exitCode=1;
}
