# Biblioteca de documentos — Implementation Plan

**Goal:** Guardar originales, versiones, páginas de texto y relaciones con productos en un módulo administrativo, con acceso explícito para asesores/clientes.
**Architecture:** D1 mantiene documentos, versiones, archivos únicos, partes de carga y páginas. R2 almacena originales. Carga multipart de 8 MiB con reanudación y cuota reservada atómicamente de 500 MB. PDF.js extrae texto en el navegador; no se contratan OCR ni servicios LLM. Estado vigente apunta a una versión aprobada, nunca a una nueva carga automáticamente.
**Tech Stack:** Vinext/React existente, D1/SQLite, R2, PDF.js, hash-wasm.
**Spec:** Propuesta aprobada en la conversación: subir/buscar/ver/descargar, categorías, relaciones múltiples con páginas, conservar versiones, permisos y estado.

## Constraints
- Sin contratar planes ni servicios externos de pago; cuota interna 500 MB, archivo máximo 200 MiB, archivos privados y autorización de servidor en cada lectura.
- Preservar audiencia de Sites y autenticación actual. No entregar documentación de reconstrucción hasta petición del usuario.
- No importar originales a Git ni al paquete de despliegue. Poblar originales con API autenticada después de publicar.
- Una carga nueva no publica ni reemplaza la versión aprobada. El texto extraído no actualiza por sí solo fichas/chatbot.

## Tasks
- [x] Añadir esquema y repositorio de documentos/versiones/archivos/partes/páginas/relaciones, pruebas de cuota y selección vigente.
- [x] API administrativa: cargas, partes, finalización/reanudación, metadatos, revisión, texto y relaciones; descargas con rangos y permisos.
- [x] Biblioteca administrativa y ficha documental con versiones, carga progresiva, extracción local y recuperación de errores.
- [x] Acceso de asesores y fuentes enlazadas en productos para clientes, respetando revocación y visita firmada.
- [x] Pruebas de archivos reales, duplicados, cuotas, versiones/ACL; revisión independiente y QA móvil/escritorio.
- [x] Publicar, importar los dos PDF y páginas ya extraídas con relaciones reales; verificar descarga original por SHA256 y dejar respaldo/exportación accesible.

## Review Focus
- Acceso directo al archivo nunca debe omitir audiencia/estado/versión aprobada.
- Reservas simultáneas no deben superar cuota; carga interrumpida no duplica partes/versiones.
- Texto escaneado/protegido no debe fingir extracción exitosa.
- Cambio de versión no altera referencias históricas ni filtra versiones pendientes.
- Visualización/descarga conserva nombre y bytes exactos; rangos HTTP permiten PDF grandes.
