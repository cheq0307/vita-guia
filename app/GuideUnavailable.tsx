export const guideMessages={
  missing:['Enlace no encontrado','Revisa que el enlace esté completo o solicita uno nuevo a la persona que te lo compartió.'],
  revoked:['Este enlace fue desactivado','Solicita un enlace nuevo para volver a consultar la guía.'],
  expired:['Este enlace ya venció','La vigencia terminó. La persona que te lo compartió puede generar otro.'],
  limit:['Este enlace alcanzó su límite','Solicita un enlace nuevo para volver a entrar.'],
} as const;
export type GuideFailure=keyof typeof guideMessages;
export function GuideUnavailable({status}:{status:GuideFailure}) {
  const [title,detail]=guideMessages[status];
  return <main className="access-screen"><div className="brand-mark">V</div><p className="eyebrow">Vita Guía</p><h1>{title}</h1><p>{detail}</p></main>;
}
