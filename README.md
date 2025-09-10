
# Ecos Universe — Styled
Incluye: video en Home, Auth (email + Google), confirmación de contraseña con 👁️, DOB con "Omitir", constelación (dropdown) y menú constelación interactivo (SVG), rutas protegidas y tabla `profiles` con RLS.

## Variables de entorno
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

## Google OAuth
- En Supabase → Authentication → Providers → Google (habilitar y credenciales).
- Redirect URL:
  - Local: http://localhost:3000/auth/v1/callback
  - Producción: https://TU-DOMINIO/auth/v1/callback

## Base de datos
Ejecuta `supabase/profiles.sql` en Supabase SQL Editor.

## Dev
npm install
npm run dev
http://localhost:3000

## Fuente del video y tipografía
- El video se espera en `/public/background.mp4` (ya copiado si subiste el archivo aquí).
- Para tipografía del video, coloca tus archivos en `/public/fonts/` (ej. `ecos.woff2`) y el CSS ya la referencia como `EcosVideoFont`.
