# Vita Guia

Sistema web independiente para compartir informacion de productos con clientes mediante enlaces temporales.

## Funciones

- Roles separados: administrador, profesional y asesor.
- El administrador crea profesionales y asesores, revisa borradores y controla las publicaciones.
- Los profesionales suben borradores; solo el administrador puede aprobarlos y publicarlos.
- Los asesores generan enlaces por cliente con fecha de vencimiento y limite opcional de aperturas.
- Una apertura cuenta por sesion; el cliente puede seguir navegando y usar el chat durante esa sesion.
- El asistente busca exclusivamente en el contenido publicado en MariaDB.
- Imagenes y videos pueden guardarse en el servidor o enlazarse desde una URL.
- No requiere Node.js, Vite, OpenAI ni Cloudflare para funcionar.

## Requisitos

- PHP 8.2 o posterior.
- MariaDB 10.5 o posterior.
- Composer.
- Extensiones PHP habituales de Laravel: PDO MySQL, mbstring, OpenSSL, tokenizer, XML, ctype, JSON y fileinfo.
- Nginx o Apache.

## Instalacion local con XAMPP

1. Crea la base de datos vita_guia_laravel con charset utf8mb4.
2. Copia .env.example como .env y configura MariaDB, APP_URL, ADMIN_EMAIL y ADMIN_PASSWORD.
3. Ejecuta:

    composer install
    php artisan key:generate
    php artisan migrate --seed
    php artisan storage:link
    php artisan serve

Los estilos y el JavaScript ya estan en public/assets; no hay que compilar nada.

## Despliegue en el servidor Atom

La configuracion propuesta asume /home/ejidos/vita-guia.

1. Crea una base y un usuario dedicado usando deploy/create_database.sql.example.
2. Sube el proyecto sin .env, vendor, pruebas ni archivos temporales.
3. En el servidor crea .env, define APP_ENV=production, APP_DEBUG=false, la URL, MariaDB y una contrasena de administrador fuerte.
4. Ejecuta una vez:

    composer install --no-dev --prefer-dist --optimize-autoloader
    php artisan key:generate
    php artisan migrate --force
    php artisan db:seed --force
    php artisan storage:link
    php artisan optimize

5. Copia deploy/nginx-vita-guia.conf a Nginx, ajusta dominio y socket de PHP-FPM, prueba con nginx -t y recarga Nginx.
6. Para las siguientes versiones ejecuta bash deploy/deploy.sh.

Para archivos de 100 MB, configura tambien en php.ini:

    upload_max_filesize = 100M
    post_max_size = 110M
    max_execution_time = 120

## Seguridad

- El document root de Nginx debe apuntar solamente a public.
- .env no se versiona y debe ser legible solo por el usuario del servicio.
- En produccion usa un usuario MariaDB dedicado, no root.
- Activa HTTPS antes de compartir enlaces reales. Ngrok sirve para pruebas; para operacion estable usa dominio y certificado propio.
- Los tokens se buscan por SHA-256 y su copia recuperable se cifra con APP_KEY.
- Los videos de testimonios requieren consentimiento de las personas que aparecen en ellos.
- El chat es informativo y no sustituye orientacion medica.

## Pruebas

    php artisan test
