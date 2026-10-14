import { env } from 'cloudflare:workers';
import { VitaRepository } from './records';
export function repository() {
  if (!env.DB) throw new Error('La base de datos de Vita Guía no está disponible.');
  return new VitaRepository(env.DB);
}
