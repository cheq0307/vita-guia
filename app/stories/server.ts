import {env} from 'cloudflare:workers';
import {StoryStore} from '../../db/story-store';
export function storyStore(){if(!env.DB)throw new Error('Las historias no están disponibles.');return new StoryStore(env.DB)}
