# Destinos Oposiciones

## Contexto del proyecto
Hay una carpeta `context/` en la raíz del repositorio con el historial de cambios del proyecto. Cada archivo es una sesión (`YYYY-MM-DD_descripcion.md`). **Lee `context/README.md` para ver el índice y consulta el archivo más reciente** al inicio de cada sesión para tener contexto.

## Stack
- **Todo el producto es front.** No hay backend ni API de pago: el Excel se lee en
  el navegador, los municipios salen de un JSON estático y las distancias las da
  Valhalla directamente desde el cliente.
- Next.js 14 (App Router, `output: "export"`) + TypeScript + Tailwind v3 + shadcn/ui v2 + Framer Motion
- Node 20 requerido (`nvm use 20`)
- shadcn/ui debe instalarse con `npx shadcn@2.5.0 add <componente>` (v2, compatible con Tailwind v3)

### Servicios externos (todos gratis y sin API key)
- **Valhalla** (`valhalla1.openstreetmap.de`) — distancias por carretera
- **CARTO** — tiles del mapa de resultados
- **Overpass** — solo al regenerar los datasets, nunca en tiempo de ejecución

Son instancias comunitarias: las llamadas salen del navegador de cada usuario, no
de un servidor nuestro, pero conviene no castigarlas.

## Cómo arrancar
```bash
cd frontend && nvm use 20 && npm run dev
```
No hace falta ninguna variable de entorno.

## Regenerar las bases de datos
Solo cuando se quieran datos más frescos de OpenStreetMap; no es parte del build.
```bash
cd frontend
node scripts/build-municipios.mjs   # public/municipios.json — 8.133 municipios
node scripts/build-nucleos.mjs      # public/nucleos.json — 79.853 pedanías y barriadas
```

## Reglas de diseño
- Paleta: **solo blanco, negro y grises**. Sin colores de acento.
- El único color permitido es el logo de Google Maps, y solo donde tenga sentido contextual.
- Estética minimalista tipo Apple/Vidext: glassmorphism, líneas dashed selectivas, fondo off-white.
- Contraste tipográfico (tonos de gris vs negro) para resaltar texto, nunca colores.
- Botones CTA en negro sólido con texto blanco.

## Reglas de desarrollo
- Comunicar siempre en español con el usuario.
- El usuario da feedback iterativo rápido — hacer cambios pequeños y dejar que valide.
- No añadir features o mejoras que no se hayan pedido.
- Conservar todas las columnas originales del Excel en los resultados.
- Las FAQs son para SEO/LLMs: formuladas como búsquedas reales de opositores, no instrucciones de uso.

## Estructura
```
frontend/
  src/app/         # Pages (landing + herramienta + blog)
  src/components/  # UI components + icons
  src/lib/
    excel.ts       # lee el .xlsx en el navegador (SheetJS)
    municipios.ts  # sitúa municipios; búsqueda en cascada
    nucleos.ts     # segunda pasada: pedanías. Carga diferida (~1 MB)
    distancias.ts  # cliente de Valhalla
    procesa.ts     # orquestador: excel → lugares → distancias
    geo.ts         # haversine y el tipo Lugar
  scripts/         # generadores de los datasets desde Overpass
  public/          # municipios.json, nucleos.json, assets, _headers
backend/           # ⚠️ obsoleto: ya no se usa. Borrar tras migrar el DNS
context/           # historial por sesión
```

## Deploy
**En transición.** Hoy sigue en Railway; el destino es Cloudflare Pages.

- **Cloudflare Pages** (pendiente): raíz `frontend`, build `npm run build`,
  salida `out`, sin variables de entorno.
- **Dominio**: `destinosoposiciones.rafatorresgarcia.com` (DNS en Cloudflare)
- El backend y los `Procfile` siguen en el repo hasta que el dominio apunte a
  Pages. Borrarlos antes deja producción rota.
