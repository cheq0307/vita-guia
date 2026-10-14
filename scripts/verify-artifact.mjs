import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const secrets = ['ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'].map(k => process.env[k]).filter(Boolean);
function verify(directory) {
  let count = 0;
  for (const entry of readdirSync(directory, {withFileTypes:true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) count += verify(file);
    else {
      if (/^\.env|^\.dev\.vars|\.sql\.env|\.bundle$/.test(entry.name)) throw new Error('Archivo privado en el artefacto de publicación.');
      const data = readFileSync(file);
      if (secrets.some(secret => data.includes(Buffer.from(secret)))) throw new Error('Un secreto administrativo aparece en el artefacto.');
      count++;
    }
  }
  return count;
}
console.log(`Artefacto revisado: ${verify('dist')} archivos; sin claves administrativas incrustadas.`);
