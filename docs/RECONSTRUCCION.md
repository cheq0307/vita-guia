# Vita Guía: guía de reconstrucción y continuidad

Estado: documento de trabajo, no entrega final. Actualización: 15 de octubre de 2026, zona America/Mexico_City.

Este archivo se mantiene en paralelo al desarrollo. Actualizarlo después de cada cambio relevante: requisitos, decisiones, estructura, datos, configuración, pasos de reproducción, pruebas y limitaciones. No presentarlo ni entregarlo hasta que el usuario indique que terminó. No incluir contraseñas, secretos de sesión, tokens de acceso, credenciales del repositorio de Sites ni respaldos de datos personales.

## 1. Propósito y experiencia prevista

Vita Guía reúne productos, información de uso, videos e historias en una biblioteca privada que un asesor comparte mediante un enlace con vigencia. El administrador gestiona asesores y enlaces, y puede alternar entre su panel y una vista de cliente.

La interfaz usa la identidad verde de Vita Guía, fondos claros, jerarquía sencilla y controles legibles. El usuario pidió reducir ruido visual, conservar una navegación superior tipo página, evitar saturación de colores y facilitar su uso por personas con poca experiencia tecnológica.

Los conceptos editoriales discutidos incluyen formatos de producto, video e historia, con enfoque de salud, negocios o mixto. Las indicaciones propias de un producto deben formar parte de su ficha; una guía independiente requiere un propósito distinto. Esta intención no equivale a funciones ya presentes en la versión publicada: consultar la sección de alcance real.

## 2. Versiones que no deben confundirse

| Versión | Ubicación o referencia | Función |
| --- | --- | --- |
| Sites actual | `C:/Users/pccue/Documents/Codex/2026-10-14/vita-guia-sites` | Fuente vigente de la publicación nueva: Vinext, Worker y D1. |
| Next.js local independiente | `C:/Users/pccue/Documents/Codex/2026-10-12/vita-guia-web` | Conserva la versión anterior con MySQL, arranque local y respaldo de datos. |
| Laravel local | `C:/ARchivosYooo/Programas/laragon/www/vita-guia` | Proyecto separado; no se incluyó su editor estructurado en la adaptación a Sites. |
| Sites anterior | `https://vita-guia-clientes.cheq-0308.chatgpt.site` | Publicación histórica con datos de prueba; no se modificó ni se recuperó su base. |

No copiar configuraciones, migraciones ni bases de una versión sobre otra. Los datos del preview, MySQL, Laravel y D1 de producción son independientes; no existe sincronización automática.

## 3. Fuente, publicación y puntos de recuperación

- Repositorio de respaldo: `https://github.com/cheq0307/vita-guia.git`.
- Rama de respaldo de Sites: `codex/vita-sites`.
- Rama de la versión Next.js local: `codex/vita-page-navigation`.
- La rama local del checkout de Sites se llama `main`; no es equivalente a la rama principal histórica del repositorio de GitHub.
- Publicación actual: `https://vita-guia.genialbull64.chatgpt.site`.
- Identidad del Site actual: `appgprj_6acf1b77ba188191bfbf88f174ff8661`, guardada en `.openai/hosting.json`.
- Commit original Next.js preservado: `065a6caa5f96460b23ca32a3acc0d509ea2158e8`.
- Primera adaptación publicada a Sites: `33314cef91db2e7589f1ea9a09fc496075bda1ab`.
- Corrección de navegación publicada: `d74142367490a2c478bbd43cbe967bad423d9cfd`.

Estos puntos identifican lo realizado durante la sesión. Antes de continuar en otra fecha, verificar Git y la publicación; no asumir que siguen siendo los últimos commits ni que el acceso a la cuenta continúa disponible.

## 4. Alcance real de la versión Sites

Implementado:

- Inicio que solicita el enlace compartido por un asesor y ofrece acceso administrativo.
- Entrada administrativa con correo y contraseña configurados en el servidor.
- Panel con formulario, listado, búsqueda y métricas de enlaces.
- Creación de enlaces con nombre, contacto opcional, vigencia y límite opcional de aperturas.
- Copiado y revocación de enlaces.
- Creación, activación y desactivación de asesores; cada asesor tiene un acceso por token.
- Panel de asesor limitado a sus propios enlaces.
- Biblioteca de ejemplo con productos, indicaciones, videos e historias.
- Inicio, Productos, Videos e Historias en páginas separadas, con menús HTML nativos y estado activo accesible.
- Buscador GET y paginación de nueve resultados por catálogo, conservados en la URL.
- Vista previa administrativa con regreso al panel y cierre de sesión.
- Mensajes para enlace inexistente, vencido, revocado o agotado.
- Asistente sencillo de respuestas locales definidas en código, sin API de IA.

No implementado en esta copia:

- Editor persistente de productos, videos, historias ni formatos por tema.
- Carga de archivos o multimedia; R2 está deshabilitado.
- Recuperación de contraseña por correo ni configuración de SMTP.
- Cuentas individuales de asesores con correo y contraseña: su acceso actual es por token.
- Sincronización o importación automática de bases anteriores.
- Límite de intentos distribuido entre Workers.

Las fichas y materiales de biblioteca son demostrativos. No presentar su texto ni sus historias como información clínica validada o testimonios comprobados.

## 5. Arquitectura y archivos principales

La interfaz React existente se adaptó al starter Vinext de Sites para ejecutar páginas y API en Cloudflare Workers. Se sustituyó el transporte TCP de MySQL por D1, compatible con SQLite. El starter conserva su integración `sites()` y los archivos de infraestructura; no reemplazarla por un despliegue Next.js convencional.

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `app/ClientPortal.tsx` | Interfaz compartida de Inicio y catálogos, indicaciones y asistente local. |
| `app/portal-content.ts` | Productos, videos e historia de demostración. |
| `app/portal-navigation.ts` | Secciones permitidas, URLs, parámetros, búsqueda sin acentos y paginación. |
| `app/library-pages.tsx` | Autorización de páginas según administrador, asesor o cliente. |
| `app/guide-visit.ts` | Firma y validación de una visita del cliente, aislada de la sesión administrativa. |
| `app/globals.css` | Identidad, diseño responsivo y estilos compartidos. |
| `app/layout.tsx` | Documento HTML y metadatos. |
| `app/page.tsx` | Entrada general que solicita enlace de asesor. |
| `app/admin/AdminDashboard.tsx` | Panel de enlaces; reutilizado con token y nombre de asesor. |
| `app/admin/usuarios/UserManager.tsx` | Gestión de asesores. |
| `app/admin-session.ts` | Credenciales administrativas, cookie firmada y protección de páginas. |
| `app/login-attempts.ts` | Pausa breve por intentos fallidos, mantenida en memoria. |
| `app/login/LoginForm.tsx` | Correo, contraseña, mostrar/ocultar, aviso de mayúsculas y errores. |
| `app/LogoutButton.tsx` | Formulario HTML nativo de cierre de sesión. |
| `app/api/admin-auth.ts` | Autorización de API y resolución de administrador o asesor. |
| `db/records.ts` | Reglas y consultas parametrizadas de asesores y enlaces. |
| `db/d1.ts` | Acceso al binding `DB` de Cloudflare. |
| `db/advisors.ts`, `db/access-links.ts` | Adaptadores usados por páginas y API. |
| `db/schema.ts`, `drizzle/` | Esquema Drizzle y migraciones SQL versionadas. |
| `vite.config.ts`, `build/`, `scripts/` | Infraestructura conservada del starter y herramientas de validación. |
| `.openai/hosting.json` | Identidad del Site y bindings; no contiene secretos. |
| `package-lock.json` | Versiones resueltas para reconstrucción reproducible. |

Versiones observadas en el código de la publicación: Node >=22.13, React 19.2.6, Vinext 1.0.0-beta.5, Vite 8.0.13, TypeScript 5.9.3, Drizzle ORM 0.45.2, Drizzle Kit 0.31.10 y Wrangler 4.92.0. Para reproducir, usar el lockfile; no actualizar librerías durante una restauración sin una tarea explícita.

## 6. Rutas y autorización

| Ruta | Comportamiento |
| --- | --- |
| `/` | Pantalla de acceso por enlace y entrada administrativa. |
| `/login` | Formulario administrativo. |
| `/admin` | Panel protegido de enlaces. |
| `/admin/usuarios` | Gestión protegida de asesores. |
| `/admin/biblioteca` | Biblioteca protegida, con controles administrativos. |
| `/asesor/[token]` | Panel del asesor activo identificado por token. |
| `/asesor/[token]/biblioteca` | Biblioteca del asesor, con regreso a su propio panel. |
| `/guia/[token]` | GET de entrada: comprueba cupo, firma cookie de visita y redirige al catálogo. |
| `/admin/biblioteca/[section]` | Página administrativa de inicio, productos, videos o historias. |
| `/asesor/[token]/biblioteca/[section]` | Mismas secciones, comprobando que el asesor siga activo. |
| `/guia/[token]/[section]` | Secciones del cliente: validan visita, vigencia y revocación. |
| `/api/auth/login` | POST de credenciales y creación de cookie. |
| `/api/auth/logout` | POST: expira cookie y redirige con 303 a `/login`. |
| `/api/advisors` | GET y POST administrativos. |
| `/api/advisors/[id]` | PATCH administrativo para alternar estado. |
| `/api/links` | GET y POST para administrador o asesor autorizado. |
| `/api/links/[id]` | PATCH para revocar; el asesor solo puede modificar sus enlaces. |

La cookie `vita_admin_session` contiene una firma HMAC y caduca a las ocho horas. Es HttpOnly, SameSite=Lax, de ruta `/`, y Secure en producción. Los secretos actuales provienen del runtime, no de D1. No afirmar que existe una tabla de administradores o almacenamiento de contraseñas hasheadas en esta implementación.

El control de intentos permite errores normales y activa una pausa de 30 segundos tras diez fallos en una ventana de dos minutos. Un acceso correcto limpia los fallos. Su estado es local al proceso; no es una defensa distribuida persistente.

Los asesores se autentican ante la API con `x-advisor-token`. Sus enlaces de acceso son credenciales: evitar su difusión o inclusión en capturas y registros públicos.

En `/guia/[token]` no se pasan los controles del administrador, incluso si el navegador tiene una sesión administrativa. Mantener esa separación al ampliar la interfaz.

Desde la separación de menús, una apertura corresponde al inicio de una visita válida: cookie `vita_guide_visit` firmada con dominio HMAC propio, HttpOnly, SameSite=Lax, Secure en producción y path exclusivo `/guia/[token]`. Su vigencia es el menor plazo entre ocho horas y el vencimiento del enlace. Una cookie no sirve para otro enlace ni concede acceso administrativo. La entrada reutiliza la visita válida sin volver a incrementar el contador; sin ella, valida e incrementa atómicamente el cupo. Las páginas de sección no incrementan aperturas, pero vuelven a comprobar vigencia y revocación. Los parámetros `q` y `pagina` se conservan durante los saltos de inicio de visita.

La búsqueda y paginación actuales trabajan sobre colecciones demostrativas en memoria: nueve resultados por página, búsqueda sin distinción de acentos o mayúsculas y límite de 120 caracteres. Una futura biblioteca persistente y de gran volumen debe aplicar búsqueda, conteo y paginación en la consulta de datos; no interpretar este filtro local como ese backend ya implementado.

## 7. Modelo de datos

`advisors`:

- `id`: entero autoincremental, clave primaria.
- `name`: texto requerido.
- `contact`: texto requerido, vacío por defecto.
- `token`: texto requerido y único.
- `active`: entero 0 o 1, uno por defecto.
- `created_at`: fecha textual con valor inicial `CURRENT_TIMESTAMP`.

`access_links`:

- `id`: entero autoincremental, clave primaria.
- `token`: texto requerido y único.
- `advisor_id`: referencia nullable a `advisors.id`, con `ON DELETE SET NULL`.
- `recipient_name`, `recipient_contact`: nombre requerido y contacto opcional guardado como texto vacío.
- `expires_at`: instante de expiración ISO UTC.
- `max_opens`: entero positivo nullable; null significa sin límite.
- `open_count`: entero no negativo, cero inicial.
- `first_opened_at`, `last_opened_at`: instantes ISO UTC nullable.
- `revoked`: entero 0 o 1, cero inicial.
- `created_by`: identificador textual del actor.
- `created_at`: fecha textual con valor inicial `CURRENT_TIMESTAMP`.

Hay índices únicos de token e índices sobre `advisor_id` y `expires_at`. La apertura usa un único `UPDATE ... RETURNING` que verifica vigencia, revocación y cupo mientras incrementa el contador; así evita que peticiones simultáneas excedan el límite. No sustituirlo por una lectura seguida de actualización sin control de concurrencia.

Migración inicial: `drizzle/0000_clean_kabuki.sql`, junto con sus metadatos Drizzle. No editar migraciones ya aplicadas: generar una nueva al modificar el esquema. Las migraciones son de estructura, sin usuarios ni enlaces iniciales.

## 8. Reconstruir desde Git en una máquina nueva

1. Instalar Git y una versión de Node compatible. Verificar `git --version`, `node --version` y `npm --version` desde la misma terminal que ejecutará el proyecto.
2. Crear una carpeta vacía y clonar la rama correcta:

   ```powershell
   git clone --branch codex/vita-sites --single-branch https://github.com/cheq0307/vita-guia.git vita-guia-sites
   Set-Location vita-guia-sites
   ```

3. Revisar la skill de Sites instalada en esa máquina. Su carpeta puede cambiar de versión; llamar sus scripts con rutas absolutas obtenidas de la instalación vigente.
4. Configurar el perfil portable con el helper correspondiente e instalar con el helper de dependencias. Conservar el lockfile y no superponer otro starter sobre la fuente restaurada.
5. Crear archivos locales de entorno a partir de `.env.example`. Usar claves nuevas para un entorno nuevo; obtener las existentes mediante el mecanismo privado autorizado si se pretende conservar una sesión/configuración anterior. Nunca copiarlas de este documento ni de Git.
6. Generar build antes de aplicar migraciones locales, para obtener `dist/server/wrangler.json`.
7. Aplicar, una sola vez y en orden, las migraciones pendientes al D1 local:

   ```powershell
   node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clean_kabuki.sql
   ```

8. Iniciar preview en loopback:

   ```powershell
   npm run dev -- --hostname 127.0.0.1 --port 8084
   ```

9. Abrir `http://127.0.0.1:8084/login` y realizar las verificaciones de la sección de pruebas. Una respuesta HTTP correcta no demuestra por sí sola que los enlaces funcionen al hacer clic.

## 9. Publicar o reconstruir en Sites

### Continuar el Site existente

Conservar el `project_id` del manifiesto. Leer el Site y su audiencia con las herramientas nativas, obtener una credencial temporal y abrir/sincronizar la fuente con el helper de Sites antes de editar. Si el acceso falla, resolver el acceso a la cuenta o al Site; no crear duplicados automáticamente.

Configurar mediante las herramientas nativas estos valores de runtime, marcando como secretos los sensibles:

| Variable | Uso |
| --- | --- |
| `ADMIN_USERNAME` | Correo del administrador de la aplicación. |
| `ADMIN_PASSWORD` | Contraseña administrativa; no incluirla en código ni artefactos. |
| `ADMIN_SESSION_SECRET` | Clave aleatoria para firmar sesiones. |
| `COOKIE_SECURE` | `true` en HTTPS de producción; `false` en preview HTTP local. |

El manifiesto declara `d1: "DB"` y `r2: null`. Sites provisiona el D1 remoto y aplica sus migraciones durante la publicación. Los valores `.env.local` y `.dev.vars` locales no sustituyen a los secretos de producción.

Ejecutar tipos, pruebas y build; revisar que el artefacto no contenga secretos. El helper de fuente debe crear y subir el commit exacto, y empaquetar su build. Guardar y desplegar ese commit/archivo mediante las herramientas nativas. Para el Site privado, usar la operación privada; no cambiar la audiencia para superar un error de autenticación. Esperar estado terminal correcto y conservar URL, commit, versión y deployment retornados.

Las credenciales temporales se pasan por stdin oculto y se mantienen solo en memoria. No usar argumentos de shell, archivos, historial, mensajes ni registros para transferirlas. Si caducan, renovarlas para el mismo proyecto.

### Crear una copia nueva en otra cuenta

Preparar un directorio nuevo y sanitizado, excluyendo `.git`, dependencias, secretos, datos locales, respaldos, builds e identidad del Site anterior. Retener el código funcional y el esquema. Seguir el flujo de creación vigente de Sites; registrar una sola vez y guardar inmediatamente el identificador nuevo retornado. No reutilizar el `project_id` anterior para una copia distinta.

La copia requiere secretos propios y empieza con una base nueva si no se importa un respaldo validado. Git recupera código y migraciones, no usuarios ni enlaces existentes. Cambiar de cuenta no constituye una transferencia automática del Site, su URL ni su D1.

### Dos capas de acceso

El Site actual se publicó privado para su propietario. Primero se entra con la cuenta propietaria de ChatGPT; después, con las credenciales administrativas de la aplicación. Son dos accesos diferentes. Los enlaces de clientes también están sujetos a la privacidad de Sites: todavía no son accesibles libremente a terceros. Cambiar esto requiere una decisión explícita de audiencia, conservando las protecciones internas de la aplicación.

## 10. Particularidades de Windows observadas

- Un Node disponible no garantiza que npm esté en PATH. Verificar ambos antes de iniciar los helpers.
- En esta máquina se usó Node de Laragon ubicado en `C:/ARchivosYooo/Programas/laragon/bin/nodejs/node-v24.16.0`.
- Se necesitó un wrapper local de npm en `.sites-runtime/bin/npm.cmd`, con rutas absolutas a Node y `npm-cli.js`, porque el lanzamiento del shim desde el helper resolvía incorrectamente su ubicación. No es un cambio global ni debe subirse a Git.
- El empaquetador de la versión de skill utilizada invocó Bash. Se añadió Git Bash al PATH del proceso: `C:/Program Files/Git/bin` y `C:/Program Files/Git/usr/bin`.
- GNU tar interpretaba `C:` del destino como un host remoto. La variable de proceso `TAR_OPTIONS=--force-local` resolvió el empaquetado. Aplicarla solo cuando se use ese empaquetador; comprobar primero la implementación vigente.
- En PTY de Windows, Enter puede llegar como `\r`. Los lectores de JSON oculto deben reconocer `\r` o `\n`; no esperar exclusivamente salto de línea Unix.
- La salida de terminal puede envolver JSON con secuencias ANSI y reposicionamiento del cursor. Conservar los resultados íntegros y verificar SHA y archivo; no deducir ni inventar identificadores de Sites a partir de texto mutilado.

No resolver estas diferencias sobrescribiendo el proyecto original, suprimiendo protecciones del navegador ni publicando claves en archivos de configuración.

## 11. Corrección de navegación que debe conservarse

En producción, hacer clic en `next/link` no cambiaba de página. Chrome registró errores `TypeError: e is not a function` y `RSC prefetch setup error`. La misma URL abierta directamente sí funcionaba: el problema estaba en la navegación del cliente de esa compilación, no en la existencia de la biblioteca.

Se sustituyó `next/link` por enlaces HTML nativos `<a href>` en `ClientPortal.tsx`, `AdminDashboard.tsx` y `UserManager.tsx`. Se preservaron rutas, estilos y permisos. La navegación completa recarga el documento; es una decisión de compatibilidad que evita que esos accesos dependan del router que falló.

Después de publicar se hicieron clics reales en Chrome: botón superior «Ver página», enlace lateral «Ver página» y regreso «Panel administrativo». Los tres cambiaron correctamente de ruta. El archivo de captura local `outputs/ver-pagina-corregido.png` documenta la biblioteca abierta; `outputs/` no se versiona.

## 12. Pruebas y criterio de entrega

Comandos de la copia Sites:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node --test tests/records.test.mjs tests/login-attempts.test.mjs
$env:VITA_TEST_URL = 'http://127.0.0.1:8084'
node --env-file=.env.local --test tests/*.test.mjs
git diff --check
```

La suite completa requiere un preview local activo, credenciales locales y migraciones aplicadas. Las pruebas de API rechazan hosts ajenos a localhost; crean datos identificados como prueba solo en el D1 local. Sin `VITA_TEST_URL`, esas pruebas se omiten: no informar entonces que se probaron los flujos HTTP.

Cobertura existente:

- Texto Unicode y caracteres especiales guardados sin corrupción.
- Separación de enlaces por asesor y revocación limitada a su propietario.
- Activación y desactivación de asesores.
- Límite de aperturas bajo peticiones simultáneas; enlace vencido e inexistente.
- Intentos de entrada, expiración de fallos y limpieza tras acceso correcto.
- API con D1 local, permisos y vista de cliente sin controles administrativos.
- Cierre de sesión desde las tres vistas de administrador y denegación posterior de API.

Evidencia histórica: siete pruebas completas pasaron durante la adaptación inicial. En la corrección de navegación pasaron tipos, cinco pruebas sin servidor, build y revisión de secretos del artefacto; además se probaron los clics en Chrome de producción. No extrapolar esos resultados a cambios futuros.

Antes de declarar una entrega nueva, comprobar con evidencia fresca: build, tipos, pruebas pertinentes, rutas protegidas, permisos, navegación de ida y vuelta, cierre de sesión y vista móvil. En móvil se verificaron controles administrativos de 44 px y ausencia de desbordamiento horizontal en la vista probada. La publicación debe devolver estado correcto y URL; una URL esperada o una operación pendiente no demuestran despliegue completado.

## 13. Respaldos y recuperación de datos

Respaldar por separado código, configuración privada y datos de cada entorno. Este documento y Git no sustituyen un respaldo de D1. La copia Sites todavía no tiene una función propia de exportar/restaurar D1; no afirmar que ya la tiene. Para recuperar datos, usar el mecanismo de exportación soportado por el proveedor y verificar la restauración en una base aparte antes de cambiar producción.

La versión Next.js local dispone de `iniciar-local.cmd`, `respaldar-datos.cmd` y scripts de arranque y dump MySQL. Sus respaldos están excluidos de Git. También se generó un bundle Git de esa versión. Esas herramientas no respaldan automáticamente el D1 de Sites y sus dumps MySQL no se aplican directamente como migraciones SQLite.

Rotar un secreto de sesión invalida las sesiones firmadas con el anterior. Cambiar de Site cambia su dirección y su identidad de plataforma; los enlaces ya compartidos no se actualizan solos.

## 14. Bitácora y trabajo pendiente

| Fecha | Hecho comprobado |
| --- | --- |
| 13–14 octubre 2026 | Se conservó la versión Next.js local independiente con MySQL y su respaldo Git. |
| 14 octubre 2026 | Se creó y publicó un Site nuevo privado; se adaptó persistencia a D1 sin importar registros de prueba anteriores. |
| 14 octubre 2026 | Se verificaron secretos runtime, cookie Secure, páginas administrativas, tablas remotas inicialmente vacías, cierre de sesión y API sin sesión. |
| 14 octubre 2026 | Se corrigió el fallo de navegación de producción mediante enlaces nativos y se respaldó el cambio en GitHub. |
| 15 octubre 2026 | Se inició esta documentación viva por petición del usuario, sin entrega final. |
| 15 octubre 2026 | Se implementaron las cuatro páginas independientes, búsqueda y paginación; once pruebas locales cubrieron permisos, visita del cliente, conservación de búsquedas y límites de aperturas. Se revisaron menús y búsqueda en navegador y el ancho móvil. |

Al continuar, actualizar esta bitácora con qué cambió, por qué, qué archivos lo implementan, cómo reconstruirlo y qué verificaciones se ejecutaron realmente. Separar solicitudes pendientes de funcionalidad entregada. No convertir la documentación en una promesa de implementar automáticamente todos los puntos pendientes.

Decisiones todavía necesarias para ampliar el producto: editor de contenido y campos por formato, consultas paginadas sobre contenido persistente, gestión de medios, recuperación de acceso, respaldo/restauración de D1 y audiencia para clientes externos. Implementarlas en su tarea correspondiente con alcance confirmado.

### Verificación de la separación de menús en producción

Publicación verificada el 15 de octubre de 2026: commit `102d870a71b797da6da51e64bfaf18b160edc25a`, deployment `appgdep_6ad072ce3f788191be8e955c3413cf06`, estado `succeeded`, URL `https://vita-guia.genialbull64.chatgpt.site`. La audiencia privada y los secretos existentes se conservaron; no hubo migraciones nuevas ni importación de datos.

En Chrome se verificó Inicio como portada, Productos/Videos/Historias como rutas distintas, búsqueda de `nutricion` devolviendo solo Vita Daily, regreso a Panel administrativo y vuelta con Ver página. Al probar formularios, esperar explícitamente su navegación antes de hacer clic en otro menú; una captura inmediata puede mostrar todavía el documento anterior. Captura de evidencia: `outputs/menus-separados-publicados.png` (archivo local ignorado por Git).

Las once pruebas completas volvieron a pasar con D1 local, incluyendo las cuatro páginas del asesor activo y la denegación al desactivarlo. La revisión independiente detectó pérdida de filtros durante la entrada del cliente y se corrigió conservando `q` y `pagina` en ambos saltos; el escenario de integración quedó cubierto. La paginación se probó con una colección sintética de 22 elementos; los materiales reales de esta copia siguen siendo tres productos, tres videos de muestra y una historia de muestra, por lo que no aparece un paginador innecesario cuando caben en una sola página.

El 15 de octubre se eliminó de la cabecera el indicador redundante «Vista de cliente»/«Acceso privado» y su punto verde, por corrección del usuario. No sustituirlo por otra etiqueta equivalente: el contexto ya se reconoce por la página y los accesos de navegación. Esto solo cambia presentación; se conservan las comprobaciones de acceso y los botones administrativos.
