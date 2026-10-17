# Aportaciones supervisadas

Objetivo: los asesores envían historias multimedia y documentos para revisión del administrador; ninguna aportación se publica ni alimenta respuestas automáticamente.

Arquitectura: área separada /asesor/:token/aportaciones y bandeja /admin/aportaciones. D1 guarda borradores, adjuntos y texto extraído. R2 y cuota existentes, transferencia multipart compartida después de autorizar cada archivo. Aprobar incorpora una copia a historias/documentos dentro de un batch atómico; los envíos aprobados quedan inmutables para su autor. Documentos aprobados se comparten con asesores, originales nunca con clientes y conocimiento del chatbot permanece interno hasta configuración administrativa explícita.

- [x] Icono Documentos y navegación hacia aportaciones.
- [x] Borrador/envío/cambios/rechazo/aprobación, autor y nota; pruebas de aislamiento y publicación.
- [x] Cargas privadas reanudables y extracción opcional por página, sin permisos administrativos delegados.
- [x] Bandeja de revisión con vista previa y acciones; formularios para asesor.
- [ ] Verificar interfaces, permisos, suite, compilación, publicación con la audiencia actual y respaldo.

Conservar usuario Daniel autorizado por Sites como visitante y al propietario. Las revisiones son decisiones humanas, no validación clínica automática. Mantener documentos y chatbot existentes. No enviar mensajes ni avisos externos automáticos.
