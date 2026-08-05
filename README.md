# 🎓 Graduación ISND 2026 — Control de Pagos

App web para gestionar graduados, invitados, pagos y proveedores de la graduación,
conectada a Supabase. Funciona bien en celular y computadora.

## 1. Crea tu proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → inicia sesión → **New Project**
2. Elige nombre, contraseña de base de datos y región (cualquiera cercana a México, ej. `us-east-1`)
3. Espera 1-2 minutos a que se aprovisione

## 2. Corre el esquema de base de datos

**Si es la primera vez que configuras la base:**
1. En tu proyecto de Supabase, ve a **SQL Editor** → **New query**
2. Copia y pega todo el contenido de `supabase/schema.sql` → **Run**
3. (Opcional pero recomendado) Corre también `supabase/seed_graduados.sql`
   en otra query nueva, para cargar tus 47 graduados actuales con lo que ya
   llevaban abonado en el Excel.

**Si ya habías corrido una versión anterior del schema:**
Corre `supabase/migracion_v2.sql` en vez de `schema.sql` — agrega los campos
nuevos de proveedores (categoría, contacto, teléfono, notas) sin borrar nada
de lo que ya tenías capturado.

## 3. Conecta la app a tu proyecto

1. En Supabase, ve a **Project Settings → API**
2. Copia el **Project URL** y la llave **anon public**
3. En este proyecto, copia `.env.example` a un archivo nuevo llamado `.env`
4. Pega tus valores:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

## 4. Corre la app localmente

```bash
npm install
npm run dev
```

Abre el link que te da la terminal (normalmente `http://localhost:5173`).

## 5. Publica la app (Netlify)

```bash
npm run build
```

Esto genera la carpeta `dist/`. Puedes:
- Arrastrar `dist/` a [app.netlify.com/drop](https://app.netlify.com/drop), o
- Conectar el repo de GitHub a Netlify con:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - **Importante:** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en
    Netlify → Site settings → Environment variables (con los mismos valores de tu `.env`)

## ¿Qué puedes hacer en la app?

- **Graduados & Invitados**: agregar/editar/eliminar graduados, buscar por nombre
  y filtrar por carrera, ver cuánto debe cada uno (se calcula solo:
  `(invitados + 1) × $1700`), y registrar tantos abonos como quieras por
  graduado (sin límite de "Abono 1, 2, 3...").
- **Proveedores**: agregar/editar/eliminar proveedores con categoría, persona
  de contacto, teléfono y notas, y registrar sus pagos con fecha.
- **Resumen**: presupuesto por categoría editable, y un dashboard con el total
  recaudado vs. lo contratado a proveedores.

## Nota sobre seguridad

Elegiste no usar login por ahora, así que cualquier persona con tu URL puede
leer y editar los datos. Cuando quieras, se puede agregar login con
email/contraseña para las organizadoras sin tener que rehacer nada. Mientras
tanto, no compartas la URL públicamente.

## Estructura del proyecto

```
graduacion-app/
├── supabase/
│   ├── schema.sql           ← corre esto si es tu primera vez
│   ├── migracion_v2.sql     ← corre esto si ya tenías datos capturados
│   └── seed_graduados.sql   ← tus 47 graduados actuales (opcional)
├── src/
│   ├── components/          ← Graduados, Proveedores, Resumen + modales
│   ├── lib/supabaseClient.js
│   ├── utils/format.js
│   ├── App.jsx
│   └── index.css            ← sistema de diseño (Poppins + Inter)
├── .env.example
└── package.json
```
