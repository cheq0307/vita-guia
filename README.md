# Vita Guía — instalación independiente

Esta rama contiene la página y el panel en Next.js. Laragon proporciona Node.js y MySQL/MariaDB. La aplicación, sus datos y su acceso administrativo funcionan sin Sites ni una sesión de ChatGPT. El código puede moverse a otra PC o a un servidor compatible.

## Abrir en esta PC

1. Enciende **MySQL en Laragon**.
2. Ejecuta **`iniciar-local.cmd`** por doble clic.
3. Abre **http://127.0.0.1:8083/admin**. Mantén abierta la ventana que inicia la aplicación; Ctrl+C la detiene.

El iniciador busca Node.js 22.13 o superior en Laragon y después en PATH. Puedes indicar otra instalación con `LARAGON_HOME` o la ruta del ejecutable mediante `VITA_NODE_PATH`. Usa `VITA_PORT` para otro puerto; el valor predeterminado es 8083. Si ya existe un servidor en ese puerto, el iniciador lo informa y no levanta otra instancia.

La instalación actual conserva su configuración y datos locales de prueba. La configuración real está en `.env.local`; los valores de `.env.example` son ejemplos.

## Instalar en otra PC

1. Copia o clona el repositorio e instala Node.js 22.13+ y MySQL/MariaDB, por ejemplo con Laragon.
2. Instala las dependencias con `npm install` o `pnpm install`.
3. Copia `.env.example` a `.env.local`. Configura `MYSQL_*`, tu correo en `ADMIN_USERNAME`, tu contraseña en `ADMIN_PASSWORD` y un `ADMIN_SESSION_SECRET` aleatorio. El archivo contiene secretos: consérvalo de forma privada, fuera de Git.
4. Enciende MySQL y ejecuta `iniciar-local.cmd`. La aplicación crea su esquema si todavía no existe.

Para recuperar datos, crea una base vacía y selecciona esa base al importar el archivo SQL del respaldo mediante tu cliente de MySQL. Configura `MYSQL_DATABASE` con su nombre. La importación puede reemplazar tablas existentes: restaura primero en una base vacía y verifica los registros.

## Qué respalda cada cosa

| Elemento | Dónde se conserva | Cómo respaldarlo |
| --- | --- | --- |
| Código, diseño y cambios | Repositorio Git local | Commits y copia remota o un `git bundle` |
| Usuarios, enlaces y aperturas | Base indicada por `MYSQL_DATABASE` | `respaldar-datos.cmd` |
| Credenciales y configuración | `.env.local` | Copia privada separada; nunca Git |
| Imágenes incluidas en el código | `public/` | Git |

La biblioteca de esta versión está definida en el código. Cuando se agreguen archivos subidos por usuarios, habrá que incluir su almacenamiento en los respaldos.

## Respaldar los datos

Ejecuta **`respaldar-datos.cmd`**. Guarda estructura y registros en `backups/`, junto a un JSON con la fecha, el nombre de la base y la suma SHA-256 del SQL. Usa transacción para las tablas InnoDB y descarta un archivo incompleto si falla.

Los respaldos están excluidos de Git. Conserva además una copia en otra unidad o en almacenamiento privado: una copia en la misma PC no protege frente a una falla del disco. Puedes cambiar el destino con `VITA_BACKUP_DIR` y la herramienta con `MYSQL_DUMP_PATH` en `.env.local`.

El repositorio no contiene una exportación de la base del Site anterior. Crear o usar esta instalación no modifica ese Site.

## Comprobaciones de desarrollo

```text
node scripts/check-db.mjs
node --experimental-strip-types --test tests/login-attempts.test.mjs
node node_modules/next/dist/bin/next build
```

Con un servidor local de prueba activo y las credenciales de `.env.local`, en PowerShell:

```powershell
$env:VITA_TEST_URL = 'http://127.0.0.1:8083'
node --env-file=.env.local --test tests/logout.test.mjs
$env:VITA_BACKUP_TEST = '1'
node --env-file=.env.local --test tests/backup-db.test.mjs
```

La prueba del respaldo crea dos bases aisladas, exporta e importa datos con caracteres especiales y una relación, verifica su integridad y elimina únicamente esas bases de prueba.

## Rutas

- `/admin`: administración de enlaces.
- `/admin/usuarios`: usuarios que comparten.
- `/admin/biblioteca`: vista previa del cliente, con regreso al panel y cierre de sesión.
- `/asesor/{token}`: espacio propio del asesor.
- `/guia/{token}`: acceso privado del cliente.
- `/`: instrucciones para abrir el enlace de un asesor.

La dirección `127.0.0.1` solo sirve en esta PC. Para que los clientes accedan desde sus equipos, habrá que desplegar esta aplicación en un servidor con HTTPS y una base persistente. Eso puede hacerse sin Sites ni dependencia de una cuenta de ChatGPT.
