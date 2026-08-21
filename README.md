# Vita Guia

Sistema web para compartir una biblioteca de productos y orientacion mediante
enlaces individuales con vigencia configurable.

## Funciones

- Panel de administrador para crear y desactivar usuarios.
- Acceso individual para que cada usuario cree, copie y revoque sus enlaces de clientes.
- Registro de primer acceso, ultimo acceso y numero de aperturas.
- Biblioteca comun de productos, rutinas, videos e historias.
- Asistente limitado a la informacion incluida en la guia.
- Persistencia local con MariaDB/MySQL de XAMPP.

## Desarrollo

```bash
npm install
npm run db:check
npm run dev
npm run build
```

## Base de datos local

1. Enciende MySQL desde el panel de XAMPP.
2. Duplica `.env.example` como `.env.local` y ajusta la contrasena si la configuraste en XAMPP.
3. Ejecuta `npm run dev`. La base `vita_guia` y sus tablas se crean automaticamente.

Tambien puedes importar `database/schema.sql` desde phpMyAdmin. Los datos permanecen en MariaDB dentro de tu PC y nunca se suben a GitHub.

La vista del cliente esta en `/`. El panel principal esta en `/admin` y cada
usuario accede mediante su enlace privado en `/asesor/{token}`.
