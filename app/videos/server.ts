import {env} from 'cloudflare:workers';
import {VideoStore} from '../../db/video-store';
export function videoStore(){if(!env.DB)throw new Error('La biblioteca de videos no está disponible.');return new VideoStore(env.DB)}
