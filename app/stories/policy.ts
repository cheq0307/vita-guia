export type StoryStatus='draft'|'published'|'archived';
export type StoryInput={title:string;author:string;body:string;period:string;products:string[];permission:boolean;status:StoryStatus};
export type StoryMedia={id:string;story_id:string;kind:'image'|'video'|'link';url:string|null;file_id:string|null;caption:string;removed:number;state:string|null;size:number|null;mime:string|null};
export type StoryItem=StoryInput&{id:string;created_at:string;media:StoryMedia[]};
export type StoryPage={items:StoryItem[];total:number;pages:number;page:number};
export function storyMediaMime(filename:string):string|null{const ext=filename.split('.').pop()?.toLowerCase();return ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',webm:'video/webm'} as Record<string,string>)[ext??'']??null}
export function storyMediaHref(base:string,storyId:string,mediaId:string){if(base.startsWith('/guia/'))return base+'/historias/archivo/'+storyId+'/'+mediaId;const advisor=/^\/asesor\/([^/]+)/.exec(base);return '/api/stories/files/'+storyId+'/'+mediaId+(advisor?'?advisor='+advisor[1]:'')}
export const storyTemplates=[{title:'Mi experiencia con Active Pro',body:'[Cuenta cómo integraste Active Pro en tu alimentación y qué cambios notaste en tu experiencia personal.]',products:['Active Pro']},{title:'Cómo integré Complex Mocha a mi rutina',body:'[Cuenta por qué empezaste a usar Complex Mocha, cómo lo incorporaste a tu rutina y qué te gustaría compartir sobre tu experiencia.]',products:['Complex Mocha']}];
