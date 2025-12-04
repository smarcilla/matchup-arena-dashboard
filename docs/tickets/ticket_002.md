Actúa como el desarrollador que creó el proyecto “Matchup Arena Dashboard” usando el prompt anterior que yo te proporcioné. Ese dashboard ya está construido, tiene su UI completa y toda la lógica de CRUD basada en operaciones sobre Vercel Blob Storage (JSONs).

Ahora quiero que realices una MIGRACIÓN TOTAL del sistema de persistencia.  
Debes mantener TODO EL UI, el diseño, los formularios, las rutas del App Router y la experiencia general EXACTAMENTE IGUAL, pero cambiando por completo la capa de datos.

## OBJETIVO

Sustituir el sistema actual basado en:

- JSON generados por el dashboard
- subidos al bucket `matchup-arena-store`
- leídos desde Blob como origen de datos

Por un sistema totalmente nuevo basado en:

- Neon (Postgres)
- Prisma ORM como única fuente de verdad
- Blob únicamente para guardar imágenes (no JSON)
- Las URL de las imágenes se guardan en BD en la tabla Player u otra entidad equivalente

## REGLAS DE MIGRACIÓN

1. NO modifiques el UI existente salvo para ajustarlo a las nuevas acciones del servidor.
2. NO mantengas ninguna lógica que genere JSON ni suba JSON al Blob.
3. Toda la lógica CRUD debe convertirse en acciones server-side usando Prisma.
4. Mantén toda la arquitectura, estructura de carpetas y componentes ya existentes.
5. Solo cambia lo necesario para que el dashboard funcione 100% contra Neon + Prisma.
6. El bucket de Blob solo se utilizará para almacenar imágenes. Las URLs deben insertarse en BD.
7. Las rutas de API deben eliminar cualquier uso de JSON como storage y reemplazarlo por consultas Prisma.

## TAREAS QUE DEBES REALIZAR

### 1. Crear el `schema.prisma` completo

Debes construir el esquema basándote en el modelo de datos actual del dashboard (el que tú mismo generaste anteriormente):

- Competition
- Matchday
- Player
- Relaciones entre ellos
- Campos adecuados para ranking, nombre, slug, rutas, orden, etc.
- Campos createdAt y updatedAt
- URL de imagen en Player

Valida que:

- No haya ciclos incorrectos.
- Prisma pueda generar migraciones sin errores.
- El modelo represente fielmente el flujo existente del dashboard.

### 2. Generar migraciones iniciales

Incluye la estructura inicial generada por Prisma para crear las tablas.

### 3. Actualizar todas las acciones del servidor (server actions)

Reemplaza operaciones de:

- lectura de JSON
- escritura de JSON
- manipulación de ficheros
- listados de Blob

Por las equivalentes usando Prisma:

- createCompetition
- updateCompetition
- deleteCompetition
- listCompetitions
- createMatchday
- updateMatchday
- deleteMatchday
- createPlayer
- updatePlayer
- deletePlayer
- listPlayersByMatchday

### 4. Actualizar las API routes

Todas las rutas que usaban Blob para datos estructurados deben eliminarse o reescribirse.  
Mantén API routes para:

- subir imagen (Blob)
- obtener URL pública
- eliminar imagen si fuese necesario

### 5. Actualizar los helpers

Elimina:

- generateCompetitionJson()
- generateRootIndex()
- uploadCompetitionJson()
- validateCompetitionJson()

Sustituye por helpers conectados a Prisma cuando sea necesario.

### 6. Mantener UI EXACTA

Todos los formularios, tablas, layouts y componentes deben seguir funcionando sin cambios visuales.  
Simplemente deben llamar a las nuevas server actions que escriben en BD.

### 7. Autenticación

No cambies el sistema de autenticación ya implementado: middleware, cookie, login, etc.  
Debe seguir funcionando exactamente igual.

### 8. Validación final

Antes de entregar la solución final, valida que:

- El dashboard arranca sin errores.
- Todas las operaciones CRUD funcionan.
- Las imágenes se suben correctamente al Blob y su URL se guarda en BD.
- Todo el flujo es coherente con el dashboard original.
- No queda ninguna referencia a JSON como mecanismo de persistencia.

## OUTPUT

Devuelve:

1. `schema.prisma` completo revisado.
2. Código actualizado de todas las server actions.
3. Código actualizado de las API routes.
4. Cambios mínimos necesarios en componentes o formularios.
5. Helpers actualizados o eliminados.
6. Instrucciones breves para ejecutar:
   - `npx prisma generate`
   - `npx prisma migrate dev`
7. Validación final explicando cómo probaste que todo funciona.

NO expliques decisiones de diseño.  
NO resumas.  
Entrega únicamente el código actualizado y necesario.
