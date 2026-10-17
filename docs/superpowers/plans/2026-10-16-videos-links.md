# Videos y enlaces

Objetivo: administrar archivos de video y enlaces externos con título y descripción; ofrecerlos en la sección Videos de la biblioteca.

Arquitectura: D1 para registros, R2 para archivos. Reutilizar reservas, cuota de 500 MB y carga multipart de archivos existentes; los videos no son documentos ni se incorporan al conocimiento del chatbot. Administrador crea/edita/publica/archiva; visitantes y asesores consultan únicamente publicaciones completas. Archivos protegidos con los accesos existentes y reproducción HTTP Range. Enlaces HTTPS abiertos en otra pestaña, sin cargar iframes externos automáticamente.

- [x] Pruebas de validación, publicación, filtros y almacenamiento compartido.
- [x] Tabla y repositorio de videos, API de gestión/carga y reproducción protegida.
- [x] Gestión administrativa, catálogo con filtros Todos/Videos/Enlaces y búsqueda paginada.
- [x] Verificar API, permisos, interfaz escritorio/móvil, compilación y publicación privada.

Decisiones: conservar paleta verde/marfil y componentes actuales; MP4/WebM hasta 200 MB; no agregar proveedores ni servicios pagados. Los borradores y archivados nunca se envían a clientes. No inventar videos de catálogo ni subir contenido de prueba a la biblioteca publicada.
