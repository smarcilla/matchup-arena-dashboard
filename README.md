# Matchup Arena Dashboard

Dashboard de administración para gestionar el contenido de Matchup Arena. Este proyecto independiente permite gestionar competiciones, matchdays, jugadores, subir imágenes y publicar JSON al Blob Storage de Vercel.

## 🚀 Características

- ✅ **Autenticación simple** - Protección por contraseña via variable de entorno
- ✅ **CRUD completo** - Gestión de competiciones, matchdays y jugadores
- ✅ **Subida de imágenes** - Drag & drop con preview
- ✅ **Modo Draft** - Trabaja en borradores antes de publicar
- ✅ **Vista previa JSON** - Visualiza y valida los JSON antes de publicar
- ✅ **Publicación automática** - Genera y sube JSON + actualiza índice raíz
- ✅ **Explorador de archivos** - Navega y gestiona archivos en Blob Storage
- ✅ **TypeScript** - Tipos estrictos para todo el proyecto
- ✅ **Tailwind CSS** - UI moderna y responsive

## 📋 Requisitos previos

- Node.js 18+
- pnpm (o npm/yarn)
- Cuenta en Vercel con Blob Storage configurado

## 🛠️ Instalación

1. **Clona el repositorio:**

   ```bash
   git clone <repo-url>
   cd matchup-arena-dashboard
   ```

2. **Instala las dependencias:**

   ```bash
   pnpm install
   ```

3. **Configura las variables de entorno:**

   Crea un archivo `.env.local` en la raíz del proyecto:

   ```env
   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
   BLOB_BUCKET_URL=https://xxxxx.public.blob.vercel-storage.com

   # Dashboard Authentication
   DASHBOARD_PASSWORD=tu-password-seguro
   ```

4. **Ejecuta el servidor de desarrollo:**

   ```bash
   pnpm dev
   ```

5. **Abre el navegador:**
   ```
   http://localhost:3000
   ```

## 🔐 Autenticación

El dashboard está protegido por una contraseña simple definida en la variable de entorno `DASHBOARD_PASSWORD`.

- Al acceder a cualquier ruta, serás redirigido a `/login`
- Introduce la contraseña configurada
- La sesión se mantiene por 7 días mediante una cookie HttpOnly

## 📁 Estructura del proyecto

```text
matchup-arena-dashboard/
├── .                            # Archivos de configuración raíz (eslint, next, pnpm, etc.)
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── blob/
│   │   │   └── files/route.ts
│   │   ├── publish/route.ts
│   │   ├── state/route.ts
│   │   ├── upload/
│   │   │   └── image/route.ts
│   │   └── validate/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── competitions/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── matchdays/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── players/
│   │   │   └── page.tsx
│   │   └── files/
│   │       └── page.tsx
│   └── login/
│       └── page.tsx
├── components/
│   ├── ConfirmDialog.tsx
│   ├── ImageUpload.tsx
│   ├── index.ts
│   ├── JsonPreview.tsx
│   ├── Loading.tsx
│   ├── Sidebar.tsx
│   └── StatusBadge.tsx
├── contexts/
│   └── DashboardContext.tsx
├── docs/
│   ├── prompt_v1.md
│   ├── fixes/
│   │   └── fix_001.md
│   └── tickets/
│       └── ticket_001.md
├── lib/
│   ├── auth.ts
│   ├── blob.ts
│   ├── types.ts
│   └── validators.ts
├── public/
├── types/
│   ├── cache-life.d.ts
│   ├── routes.d.ts
│   └── validator.ts
├── middleware.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

## 📦 Tipos de datos

### Player

```typescript
type Player = {
  name: string;
  image: string; // URL en Blob
  ranking: number;
};
```

### CompetitionFile

```typescript
type CompetitionFile = {
  name: string;
  matchday: number;
  players: Player[];
};
```

### RootIndex

```typescript
type RootIndex = {
  competitions: {
    name: string;
    matchday: number;
    file: string; // Ruta del JSON en Blob
  }[];
};
```

## 🔄 Flujo de trabajo

1. **Crear una competición**

   - Navega a "Competitions" → "New Competition"
   - Define nombre y slug (usado en rutas de archivo)

2. **Crear un matchday**

   - Navega a "Matchdays" → "New Matchday"
   - Selecciona competición y número de jornada

3. **Añadir jugadores**

   - Entra en el matchday
   - Click "Add Player"
   - Sube imagen (drag & drop)
   - Define nombre y ranking

4. **Publicar**

   - Revisa la vista previa JSON
   - Click "Validate" para verificar
   - Click "Publish to Blob"

5. **Verificar**
   - Navega a "Blob Files"
   - Confirma que los JSON están subidos

## 📂 Estructura de archivos en Blob

```
matchup-arena-store/
├── competitions/
│   ├── index.json              # Índice raíz
│   ├── la-liga/
│   │   ├── 1.json              # Matchday 1
│   │   └── 2.json              # Matchday 2
│   └── premier-league/
│       └── 1.json
├── images/
│   ├── la-liga/
│   │   └── 1/
│   │       ├── messi.webp
│   │       └── ronaldo.webp
└── draft/
    └── dashboard-state.json    # Estado del dashboard
```

## 🚀 Despliegue en Vercel

1. **Conecta el repositorio a Vercel**

2. **Configura las variables de entorno:**

   - `BLOB_READ_WRITE_TOKEN`
   - `BLOB_BUCKET_URL`
   - `DASHBOARD_PASSWORD`

3. **Despliega**
   ```bash
   vercel deploy --prod
   ```

## 🔒 Seguridad

- **Contraseña**: Usa una contraseña fuerte y única
- **Variables de entorno**: Nunca commits el archivo `.env.local`
- **Tokens**: Los tokens de Blob tienen permisos de lectura/escritura
- **HTTPS**: Vercel proporciona HTTPS automáticamente
- **Cookies HttpOnly**: La sesión no es accesible via JavaScript

## ⚠️ Consideraciones

- El estado del dashboard se guarda en el Blob (no en base de datos)
- Las imágenes eliminadas del dashboard NO se eliminan del Blob automáticamente
- Usa el explorador de archivos para limpiar archivos huérfanos
- El índice raíz se regenera automáticamente al publicar

## 🛠️ Scripts disponibles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Ejecutar producción
pnpm start

# Linter
pnpm lint
```

## 📝 API Endpoints

| Método | Ruta                | Descripción                     |
| ------ | ------------------- | ------------------------------- |
| POST   | `/api/auth/login`   | Iniciar sesión                  |
| POST   | `/api/auth/logout`  | Cerrar sesión                   |
| GET    | `/api/state`        | Obtener estado del dashboard    |
| PUT    | `/api/state`        | Actualizar estado del dashboard |
| POST   | `/api/upload/image` | Subir imagen de jugador         |
| POST   | `/api/publish`      | Publicar matchday               |
| GET    | `/api/blob/files`   | Listar archivos en Blob         |
| DELETE | `/api/blob/files`   | Eliminar archivo del Blob       |
| POST   | `/api/validate`     | Validar estructura JSON         |

## 📄 Licencia

MIT

---

Desarrollado para **Matchup Arena** 🏆
