# Vita Guía — Sites

Copia para Sites de la versión local Next.js, con Vinext, Cloudflare Workers y D1. El proyecto local y su MySQL siguen separados.

## Funciones conservadas

- Panel `/admin`: crear, copiar y revocar enlaces para clientes.
- Usuarios `/admin/usuarios`: crear asesores y activar/desactivar sus accesos.
- Biblioteca `/admin/biblioteca`: vista previa de cliente con regreso al panel y cierre de sesión.
- Accesos por token `/asesor/[token]` y `/guia/[token]`, con vigencia y límite de aperturas.
- Acceso administrativo con correo propio, cookie firmada, contraseña protegida como secreto de runtime y pausa breve ante intentos repetidos.

Productos, videos e historias son todavía contenido de demostración definido en `app/ClientPortal.tsx`; esta copia no incluye el editor de contenidos de la versión Laravel.

## Configuración privada

Configurar `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` y `COOKIE_SECURE` mediante las herramientas nativas de Sites. En producción `COOKIE_SECURE=true`; en preview HTTP local usar false. `.env.example` documenta solo nombres y valores ficticios. `.env*`, `.dev.vars*`, `outputs/`, `.wrangler/` y `.sites-runtime/` están ignorados. No subir claves ni respaldos de datos.

El nuevo Site empieza privado para el propietario. Sus enlaces de cliente seguirán sujetos a esa política de Sites mientras no se cambie explícitamente su audiencia; la autorización por token de la aplicación se conserva.

## Datos y migraciones

`db/schema.ts` define asesores y enlaces. `drizzle/` contiene las migraciones versionadas; la publicación aplica las migraciones a D1. No se crea ni modifica el esquema durante las solicitudes. `db/records.ts` contiene consultas parametrizadas y una actualización atómica del contador de aperturas.

La base de Sites empieza vacía. No hay sincronización automática con MySQL, el Site anterior ni el preview local. Mantener respaldos independientes de cada entorno.

## Verificación y preview

Node >=22.13; instalación, build y publicación siguen los helpers de la skill Sites. Para desarrollo: `npm run dev -- --hostname 127.0.0.1 --port 8084`. Aplicar antes las migraciones D1 locales según el README del starter de Sites.

- Tipos: `node node_modules/typescript/bin/tsc --noEmit`
- Pruebas SQLite: `node --test tests/records.test.mjs tests/login-attempts.test.mjs`
- Pruebas API y logout con preview local: definir `VITA_TEST_URL=http://127.0.0.1:8084` y ejecutar `node --env-file=.env.local --test tests/*.test.mjs`.

Las pruebas API solo permiten localhost y crean registros identificados como prueba en la base local del preview. Nunca se ejecutan contra producción.
