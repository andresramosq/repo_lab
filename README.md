# Repositorio para Compartir

Comunidad web para publicar, buscar y valorar prompts y guías prácticas sobre inteligencia artificial. Incluye autenticación, perfiles, imágenes, Markdown seguro, categorías, etiquetas, votos, favoritos, comentarios, reportes, moderación y datos de demostración.

## Inicio rápido con Docker

Requisito: Docker con Compose.

```bash
docker compose up --build
```

La primera ejecución crea PostgreSQL, aplica las migraciones y carga 15 publicaciones. Abre [http://localhost:3000](http://localhost:3000).

Para detener el sistema:

```bash
docker compose down
```

Para reiniciar también todos los datos:

```bash
docker compose down -v
docker compose up --build
```

## Credenciales de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@repositorio.local` | `Admin123!` |
| Usuario | `juanito@demo.local` | `Demo123!` |
| Usuario | `maria@demo.local` | `Demo123!` |

## Desarrollo local

Requisitos: Node.js 22+, npm y PostgreSQL 16+.

```bash
cp .env.example .env
npm install
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

La URL de PostgreSQL se configura en `DATABASE_URL`. Cambia `NEXTAUTH_SECRET` por un valor aleatorio largo fuera del entorno local.

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm start            # ejecutar el build
npm test             # pruebas automatizadas
npm run lint         # análisis estático
npm run db:migrate   # aplicar migraciones
npm run db:seed      # recargar los datos demo
```

## Funciones disponibles

- Registro, inicio y cierre de sesión con contraseñas hasheadas.
- Publicaciones en borrador o publicadas, edición y eliminación con autorización.
- Prompt copiable, explicación Markdown sanitizada y hasta cinco imágenes.
- Búsqueda en título, resumen, contenido, prompt y etiquetas.
- Filtros por categoría y etiqueta; orden por tendencia, utilidad o fecha.
- Paginación, publicaciones relacionadas y metadatos sociales.
- Votos útil/no útil, favoritos, comentarios y reportes.
- Perfil público y panel personal con estadísticas.
- Panel de administración para moderación y bloqueo de usuarios.
- Índice PostgreSQL `tsvector` en la migración para búsqueda a escala.
- Interfaz responsive para escritorio y móvil.

## Imágenes en producción

En desarrollo y en Docker, `/api/upload` guarda archivos en el volumen persistente `uploads`. Para despliegues con múltiples instancias, cambia esa ruta por S3 o Cloudinary y conserva en la base de datos la URL devuelta. Las validaciones actuales permiten JPG, PNG, WEBP y GIF de hasta 5 MB.

## Estructura principal

- `app/`: páginas y endpoints con Next.js App Router.
- `components/`: interfaz y formularios interactivos.
- `lib/`: autenticación, acceso a datos, validación y ranking.
- `prisma/`: modelo, migración y seed.
- `tests/`: pruebas básicas de autenticación, publicaciones y votos.

## Seguridad

Las contraseñas usan bcrypt, las sesiones JWT son firmadas, todas las mutaciones verifican sesión y autoría, Zod valida entradas, Markdown se sanitiza contra XSS y las imágenes se validan por tipo y tamaño. En producción se recomienda añadir rate limiting distribuido en el proxy o mediante Redis y configurar HTTPS.
