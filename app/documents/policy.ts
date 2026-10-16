export const categories={technical:'Ficha técnica',catalog:'Catálogo',training:'Capacitación',business:'Negocio',other:'Otro'};
export const audiences={internal:'Solo administración',advisors:'Administración y asesores',clients:'Administración, asesores y clientes'};
export const statuses={pending:'Pendiente de revisión',current:'Vigente',archived:'Archivado'};
export const fileTypes:Record<string,string>={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',txt:'text/plain',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
export function fileMime(name:string){return fileTypes[name.split('.').pop()?.toLowerCase()??'']??null}
export function cleanFilename(name:string){return name.replace(/[\\/\r\n\x00-\x1f]/g,'_').trim().slice(0,180)||'documento'}
export function bytesLabel(value:number){return value>=1e6?`${(value/1e6).toFixed(1)} MB`:`${Math.ceil(value/1000)} KB`}
