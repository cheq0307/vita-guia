# Document assistant implementation plan

> Execute inline with executing-plans; one final independent code review.

**Goal:** Conectar el asistente a texto aprobado y autorizado, con documento, versión, página y acceso al original.
**Spec:** Aprobación «POS VA» a consultar texto de documentos autorizados, reconocer ausencia de respuesta y citar documento/versión/página. Se conserva la restricción de gratuidad, catálogo y autenticación existentes.
**Architecture:** Búsqueda FTS5 local en D1 con índice mantenido por triggers; backfill administrativo paginado fuera de migraciones. API servidor aplica autorización y versión vigente antes de recuperar fragmentos. Respuestas extractivas, sin generación LLM ni servicios de pago. Las reglas existentes conservan advertencias/conflictos; los documentos complementan preguntas que no resuelven las fichas. Chat separado como componente con carga/error/reintento y citas plegadas.
**Tech Stack:** Vinext, React, TypeScript, D1 SQLite FTS5; sin nuevas dependencias.

## Constraints and review focus
- No ampliar permisos de documentos existentes ni audiencia de Sites. Cliente usa POST /guia/TOKEN/asistente dentro de cookie de visita. Asesor requiere token activo; administrador cookie actual.
- Solo documento current, versión current_version_id aprobada, archivo ready y text_status extracted, incluso para admin. Internos nunca se filtran a cliente/asesor.
- Acotar pregunta a600 caracteres, búsqueda a12 términos, resultados a6páginas y salida3fragmentos. No ejecutar operadores FTS enviados por usuario ni HTML del PDF.
- Producto/presentación explícitos o contexto deben filtrar relaciones y rangos; nunca mezclar sabores ni resolver conflictos de dosis con el primer fragmento.
- Preguntas personales/médicas mantienen precauciones y no extraen dosis como recomendación. Citas solo describen contenido del documento, no validación clínica.
- Archivar/revocar/cambiar versión debe surtir efecto en cada petición; no caché ni historial persistente de preguntas.

## Tasks
- [x] TDD de búsqueda realSQLite: permisos, versiones, rangos, acentos, texto desconocido, triggers y backfill idempotente. Añadir0002custom schema-only y db/document-search.ts.
- [x] TDD de política/construcción: intención y producto, variantes ambiguas, extractos con origen exacto, advertencias y ausencia de respuesta. Añadir app/assistant/policy.ts y answer.ts.
- [x] API POST /api/assistant y /guia/[token]/asistente; POST /api/assistant/index admin para backfill25páginas. PruebasHTTP de auth/revocación/origin/límites y actualización aprobada.
- [x] Extraer UI a app/assistant/AssistantChat.tsx; integrar en ClientPortal con contexto, citas, carga y reintento; QA navegador/móvil.
- [x] Suite completa, TSC, build, diff y revisión independiente. Publicar mismaSite, backfill89páginas sin cambiar accesos, comprobar consulta real y conservar prueba visual.

## Execution ledger
- Source opened at7919c89c97b7e2d52537dc331de1dbddbf6af3b7. Existing documentation changes preserved.

- Final: fixed contexto de producto desconocido y aliasMocha — tests document-assistant RED→GREEN, suite32/32; sin hallazgos diferidos.
- Publicado9f8537e0081361c39cda4ab27ec1acafe42d99a2, deploymentappgdep_6ad1cb00166c8191b317038a31ed565f succeeded. Producción89páginas indexadas; consultaMocha-inulina y ayuno cita ficha v1p13, desconocido sinfuentes, precauciones/conflictos conservados y anónimo401.
