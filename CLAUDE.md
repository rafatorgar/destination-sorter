# Destinos Oposiciones

## Contexto del proyecto
Hay una carpeta `context/` en la raíz del repositorio con el historial de cambios del proyecto. Cada archivo es una sesión (`YYYY-MM-DD_descripcion.md`). **Lee `context/README.md` para ver el índice y consulta el archivo más reciente** al inicio de cada sesión para tener contexto.

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind v3 + shadcn/ui v2 + Framer Motion
- **Backend:** FastAPI + Python 3 + Google Maps Distance Matrix API
- Node 20 requerido para el frontend (`nvm use 20`)
- shadcn/ui debe instalarse con `npx shadcn@2.5.0 add <componente>` (v2, compatible con Tailwind v3)

## Cómo arrancar
```bash
# Backend
cd backend && python3 -m uvicorn main:app --port 8000

# Frontend
cd frontend && nvm use 20 && npm run dev
```
El backend necesita `GOOGLE_MAPS_API_KEY` en `backend/.env`.

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
backend/
  main.py          # FastAPI app con streaming NDJSON
  .env             # GOOGLE_MAPS_API_KEY (no commitear)
  requirements.txt
frontend/
  src/app/         # Pages (landing + herramienta)
  src/components/  # UI components + icons
  public/          # Assets (google-maps-icon.png)
context/
  CHANGELOG.md     # Historial de cambios por sesión
```

## Deploy
Target: Railway (dos servicios). Pendiente de configurar.
