# Vita Guia

Sistema web para compartir una biblioteca de productos y orientacion mediante
enlaces individuales con vigencia configurable.

## Funciones

- Panel de administrador para crear y desactivar usuarios.
- Acceso individual para que cada usuario cree, copie y revoque sus enlaces de clientes.
- Registro de primer acceso, ultimo acceso y numero de aperturas.
- Biblioteca comun de productos, rutinas, videos e historias.
- Asistente limitado a la informacion incluida en la guia.
- Persistencia de enlaces con Cloudflare D1.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

La vista del cliente esta en `/`. El panel principal esta en `/admin` y cada
usuario accede mediante su enlace privado en `/asesor/{token}`.
