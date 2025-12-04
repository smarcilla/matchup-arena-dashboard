# ROLE

Actúa como un arquitecto senior full-stack especializado en Next.js 15/16 (App Router), TypeScript, TailwindCSS y Vercel Blob Storage. Estás trabajando dentro de un repositorio recién creado mediante:

```
npx create-next-app@latest
```

El repo está completamente limpio y sin lógica adicional.

Tu misión es construir un **dashboard completo** para administrar el contenido de mi app principal “Matchup Arena”.  
Este dashboard es un proyecto **independiente** cuyo único objetivo es:

- gestionar competiciones
- crear matchdays
- añadir jugadores
- subir imágenes
- generar JSON correctos
- subirlos al Blob
- actualizar el JSON raíz
- permitir una vista previa antes de publicar
- trabajar en modo draft sin tocar producción
- autenticar con **auth ultra simple** (password definida en env)

El bucket de Blob ya existe y se llama:

```
matchup-arena-store
```

En este dashboard se usarán los tokens y urls que ya tendré en mis variables de entorno:

```
BLOB_READ_WRITE_TOKEN=
BLOB_READ_TOKEN=
BLOB_BUCKET_URL=
DASHBOARD_PASSWORD=
```

---

# OBJECTIVE

Necesito que generes **TODO EL PROYECTO COMPLETO** dentro del repo actual:

1. **Arquitectura del dashboard**
2. **Estructura de carpetas final**
3. **Implementación de autenticación ultra simple**
   - página `/login`
   - middleware que bloquea todo lo demás
   - comprobación por password via env
4. **CRUD completo**
   - Competitions
   - Matchdays
   - Players
5. **Subida de imágenes al Blob**
6. **Generación automatizada de JSON**
   - `/competitions/index.json`
   - `/competitions/<competition>/<matchday>.json`
7. **Modo Draft → Previsualización → Publicación final**
8. **API Routes reales para:**
   - Subir JSON
   - Subir imágenes
   - Listar archivos en el blob
   - Validar estructuras
9. **Modelos tipados en TypeScript**

   ```ts
   export type Player = {
     name: string;
     image: string; // URL Blob
     ranking: number;
   };

   export type CompetitionFile = {
     name: string;
     matchday: number;
     players: Player[];
   };

   export type RootIndex = {
     competitions: {
       name: string;
       matchday: number;
       file: string; // ruta JSON en blob
     }[];
   };
   ```

10. **UI en Tailwind**
    - Formulario de competición

- Formulario de matchday
- Formulario de jugadores
- Upload de imagen (drag & drop)
- Tabla de competiciones
- Tabla de jugadores
- Vista previa JSON
- Botón “Validar”
- Botón “Publicar”

11. **Helper utilities**
    - `uploadCompetitionJson()`
    - `uploadPlayerImage()`
    - `generateRootIndex()`
    - `validateCompetitionJson()`
    - `blobPath()` helpers
12. **README final completo**
    - Instalación
    - Configurar `.env`
    - Cómo conectar con Vercel
    - Cómo publicar cambios
    - Flujo de trabajo recomendado

---

# CONSTRAINTS & RULES

- Usa App Router 100%.
- Nada en Pages Router.
- Código limpio, modular, cero placeholders.
- Usa `@vercel/blob` para todas las operaciones.
- Usa form actions **server actions** cuando tenga sentido.
- Implementa errores detallados.
- Explica dónde colocar cada archivo nuevo.
- No dejes pasos a medias.
- El resultado debe ser **código funcional listo para ejecutar**.
- No inventes endpoints que Vercel Blob no soporte.
- No uses librerías innecesarias.

---

# QUALITY EXPECTATIONS

- Piensa como un tech lead.
- Entrega todo el código necesario para que el dashboard compile sin errores.
- Propón mejoras arquitectónicas si ves problemas.
- No resumas. No omitas partes.
- Usa nombres claros y consistentes.
- Asegúrate de que todas las rutas funcionan.

---

# FINAL OUTPUT FORMAT

**Tu respuesta debe incluir:**

1. Estructura final del proyecto
2. Archivos completos con su contenido
3. Explicación de dónde van cada uno
4. Todas las páginas del dashboard
5. Todas las API routes
6. Implementación completa del auth
7. Helpers
8. Componentes
9. README final
10. Consejos de seguridad
11. Pasos para desplegar en Vercel
12. Validación del flujo end-to-end

Este resultado debe ser **copiable directamente** dentro del repo.

---

# END OF PROMPT

Genera ahora el proyecto completo siguiendo TODAS las instrucciones anteriores.
