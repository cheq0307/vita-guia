# Vita Guía · wireframes móviles

Versión 1 · 17 de octubre de 2026 · 84 pantallas y estados.

Abrir `vita-guia-mobile.html` en un navegador. Es autónomo y funciona sin conexión; no modifica el sitio publicado.

## Alcance

Cliente/comunidad, usuario/asesor y administrador. Navegación y distribución propuestas para celular a 390 × 844; lógica contrastada contra el código actual. No decide todavía PWA o aplicación nativa.

Recorrer la app abre un prototipo; Todas las pantallas muestra el inventario; Flujos y permisos explica conexiones y límites; Imprimir todos prepara las hojas para impresión o Guardar como PDF desde el navegador.

Los textos entre corchetes son marcadores. No son datos reales, testimonios ni recomendaciones nuevas. Los controles navegan entre ejemplos; no cargan archivos ni ejecutan operaciones del sistema.

## Reglas conservadas

- El cliente entra desde una guía vigente; no ve documentos originales ni herramientas internas.
- El usuario entra con enlace personal, administra enlaces propios y propone historias/documentos.
- El administrador revisa envíos, administra contenido y controla versiones y audiencias.
- Borrador → en revisión → aprobado / cambios solicitados / no aprobado; solo aprobación incorpora contenido.
- Documento aprobado de usuario: vigente para asesores, conocimiento interno; no se comparte con el chatbot del cliente por defecto.
- Archivos y conocimiento tienen permisos diferentes. Originales conservados y versiones históricas no se reemplazan silenciosamente.
- Producto reúne sus indicaciones, variantes, ingredientes, beneficios y precauciones. Preguntas flexibles, faltantes explícitos.
- Videos alojados y enlaces externos; historias escritas, multimedia o ambas.
- Sin compras, cobros, suscripciones, roles extra, registro público, IA externa ni supuestos de notificaciones push.
- Acceso externo de Sites es del proveedor y adicional al acceso de aplicación.

## Decisiones móviles propuestas

- Barra inferior para destinos frecuentes por rol; contenido no se navega mediante anclas.
- Biblioteca del cliente conserva regreso al panel cuando quien la abre es administrador o asesor.
- Formularios y decisiones administrativas se dividen en pasos de lectura vertical.
- Listados administrativos usan filas/cards en vez de arrastrar una tabla ancha.
- Estados de espera, vacío, error, cuota, pausa, caducidad y revisión tienen una salida clara.
- Los visores y confirmaciones compartidos vuelven al módulo que los abrió; algunos ejemplos del prototipo usan una ruta de referencia.

## Inventario

| ID | Recorrido | Módulo | Pantalla |
|---|---|---|---|
| E01 | access | Acceso | Acceso administrativo |
| E02 | access | Acceso | Datos de acceso incorrectos |
| E03 | access | Acceso | Guía no disponible |
| E04 | access | Acceso | Acceso de usuario desactivado |
| E05 | access | Acceso | Sesión administrativa terminada |
| E06 | access | Acceso | Puerta de acceso de Sites |
| C01 | client | Inicio | Inicio de la guía |
| C02 | client | Productos | Catálogo de productos |
| C04 | client | Productos | Detalle de producto |
| C05 | client | Productos | Función y beneficios |
| C06 | client | Productos | Ingredientes y características |
| C07 | client | Productos | Preparación e indicaciones |
| C08 | client | Productos | Seguridad y precauciones |
| C09 | client | Productos | Preguntas frecuentes |
| C10 | client | Videos | Videos y enlaces |
| C11 | client | Videos | Reproducir video |
| C12 | client | Videos | Video de otra página |
| C13 | client | Historias | Historias de éxito |
| C14 | client | Historias | Leer una historia |
| C15 | client | Chat | Asistente Vita |
| C16 | client | Chat | Aclarar una presentación |
| C17 | client | Chat | Información no confirmada |
| C18 | client | Búsqueda | Sin coincidencias |
| U01 | advisor | Panel | Mi espacio |
| U02 | advisor | Enlaces | Mis enlaces |
| U03 | advisor | Enlaces | Crear enlace |
| U04 | advisor | Enlaces | Enlace creado |
| U05 | advisor | Enlaces | Detalle del enlace |
| U06 | advisor | Enlaces | Confirmar desactivación |
| U07 | advisor | Más | Más opciones |
| U08 | advisor | Documentos | Documentos compartidos |
| U09 | advisor | Documentos | Detalle del documento |
| U10 | advisor | Documentos | Visor del archivo |
| U11 | advisor | Aportaciones | Mis aportaciones |
| U12 | advisor | Aportaciones | Qué quieres compartir |
| U13 | advisor | Aportaciones | Escribir historia |
| U14 | advisor | Aportaciones | Proponer documento |
| U15 | advisor | Aportaciones | Adjuntos de la historia |
| U16 | advisor | Aportaciones | Subiendo archivo |
| U17 | advisor | Aportaciones | Revisar mi envío |
| U18 | advisor | Aportaciones | En revisión |
| U19 | advisor | Aportaciones | Cambios solicitados |
| U20 | advisor | Aportaciones | No aprobado |
| U21 | advisor | Aportaciones | Aprobado |
| A01 | admin | Panel | Panel administrativo |
| A02 | admin | Contenido | Gestionar contenido |
| A03 | admin | Usuarios | Usuarios registrados |
| A04 | admin | Usuarios | Crear usuario |
| A05 | admin | Usuarios | Acceso del usuario |
| A06 | admin | Usuarios | Activar o desactivar usuario |
| A07 | admin | Enlaces | Enlaces del administrador |
| A08 | admin | Enlaces | Crear enlace de cliente |
| A09 | admin | Enlaces | Administrar un enlace |
| A10 | admin | Documentos | Biblioteca documental |
| A11 | admin | Documentos | Subir documento |
| A12 | admin | Documentos | Administrar documento |
| A13 | admin | Documentos | Versiones del documento |
| A14 | admin | Documentos | Productos relacionados |
| A15 | admin | Documentos | Definir páginas de un producto |
| A16 | admin | Documentos | Información y permisos |
| A17 | admin | Documentos | Texto extraído por página |
| A18 | admin | Información interna | Consulta documental interna |
| A19 | admin | Videos | Gestionar videos y enlaces |
| A20 | admin | Videos | Subir o editar video |
| A21 | admin | Videos | Agregar enlace de video |
| A22 | admin | Historias | Gestionar historias |
| A23 | admin | Historias | Crear o editar historia |
| A24 | admin | Historias | Multimedia de una historia |
| A25 | admin | Revisión | Bandeja de aportaciones |
| A26 | admin | Revisión | Revisar historia de usuario |
| A27 | admin | Revisión | Revisar documento de usuario |
| A28 | admin | Revisión | Decidir sobre la aportación |
| A29 | admin | Revisión | Decisión guardada |
| A30 | admin | Confirmaciones | Confirmar una acción |
| A31 | admin | Documentos | Abrir archivo original |
| A32 | admin | Documentos | Aprobar versión vigente |
| A33 | admin | Revisión | Texto de un documento propuesto |
| A34 | admin | Más | Más opciones del administrador |
| S01 | state | Estados | Cargando contenido |
| S02 | state | Estados | Error al consultar |
| S03 | state | Estados | Primera aportación |
| S04 | state | Estados | Sin espacio para archivos |
| S05 | state | Estados | Carga pausada |
| S06 | state | Estados | Regreso desde un enlace externo |

## Flujos

- Cliente: consultar y preguntar: C01 → C02 → C04 → C07 → C15 → C16
- Videos y recursos externos: C10 → C11 → C12 → S06
- Historia propuesta por usuario: U11 → U12 → U13 → U15 → U17 → U18 → A25 → A26 → A28 → A29 → U21
- Documento propuesto por usuario: U11 → U14 → U16 → U17 → U18 → A25 → A27 → A33 → A28 → U21
- Pedir cambios y reenviar: A25 → A26 → A28 → U19 → U13 → U17 → U18
- Crear y entregar acceso de usuario: A03 → A04 → A05 → E06 → U01
- Crear un enlace de cliente: U01 → U03 → U04 → U05 → C01
- Nueva versión y conocimiento: A10 → A11 → A12 → A17 → A14 → A15 → A16 → A32
- Administración ↔ recorrido del cliente: A01 → C01 → C02 → C04 → A01

## Comprobaciones de preparación

El generador valida identificadores, destinos de botones y regreso. Las pruebas visuales y de navegación se realizan sobre el HTML generado; no se altera el producto publicado.

## Fuentes de la lógica

app/admin/AdminDashboard.tsx; app/admin/usuarios/UserManager.tsx; app/ClientPortal.tsx; app/ProductDetail.tsx; app/portal-navigation.ts; app/documents/{DocumentLibrary,DocumentDetail,DocumentUploader}.tsx; app/contributions/{Contributions.tsx,api.ts}; app/videos/{VideoManager,VideoCatalog}.tsx; app/stories/{StoryManager,StoryCatalog}.tsx; app/assistant/AssistantChat.tsx; db/contribution-store.ts.

Revisión realizada: 84 destinos navegables, galería con 84 marcos, sin desbordamiento horizontal interno, regreso entre página/panel y edición de documento conservados. JavaScript sin errores de sintaxis; no hay llamadas de red ni controles administrativos en las pantallas de cliente.
