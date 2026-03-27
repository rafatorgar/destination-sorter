# Changelog — Destinos Oposiciones

## 2026-03-27 — Sesión 1: Setup inicial + diseño completo

### Setup
- Repositorio creado con estructura **frontend** (Next.js 14 + TypeScript + Tailwind) y **backend** (FastAPI + Python)
- Instalado **shadcn/ui** (v2, compatible Tailwind v3) con componentes: Button, Input, Label, Card, Accordion, Table
- Instalado **Framer Motion** para animaciones
- Instalado **tailwindcss-animate**
- Node 20 requerido para el frontend (nvm use 20)

### Diseño y paleta
- Paleta: **blanco, negro y grises** — sin color de acento
- Estilo **glassmorphism** (Apple) en cards y header: `bg-white/60 backdrop-blur-xl`
- Fondo general **off-white** (97%) con secciones en blanco puro para contraste
- **Líneas dashed** como separadores entre secciones (estilo Vidext)
- Header sticky con blur y borde dashed
- Footer con firma: "Una herramienta de rafatorresgarcia.com"

### Landing page (/)
- **Hero** con título en dos tonos (gris + negro), rutas SVG animadas, pins decorativos
- **DestinationRadar**: componente visual interactivo con fondo oscuro, radar animado que revela destinos (Madrid, Barcelona, etc.) conforme la onda expansiva les alcanza. Ciclo continuo con fade in/out sincronizado al pulso
- **Steps** ("Cómo funciona"): 3 pasos con iconos propios (ExcelIcon, Google Maps icon, DownloadIcon), animación secuencial al scroll, conectores con líneas dashed y flechas
- **Features** ("Todo lo que necesitas"): 3 features en layout alternado con snippets visuales (radar, tabla, descarga)
- **FAQs**: 8 preguntas SEO-oriented en Accordion, dentro de contenedor con bordes dashed laterales
- **CTA final**: recuadro blanco con borde dashed, centrado, dentro del mismo contenedor dashed que las FAQs

### Herramienta (/herramienta)
- Formulario centrado: municipio + upload Excel (sin API Key, se configura server-side)
- **Streaming de resultados**: backend envía NDJSON línea a línea, frontend muestra progreso en tiempo real
- Al procesar: formulario desaparece, aparecen resultados con animación
- **Barra de progreso** + **log en vivo** tipo terminal mostrando cada destino conforme se calcula
- **ResultsRadar**: visual interactivo con pan/zoom (drag + scroll), los 20 destinos más cercanos, hover para ver nombre, escala lineal con anillos cada 20km, AnimatePresence para transiciones suaves
- **Tabla** con todas las columnas originales del Excel preservadas, ordenada por km
- **Descarga CSV** generada en frontend con todas las columnas

### Backend
- API Key de Google Maps via variable de entorno `GOOGLE_MAPS_API_KEY` (cargada con python-dotenv desde `.env`)
- `POST /api/procesar`: streaming NDJSON (start → destinos uno a uno → done) con todas las columnas del Excel
- `POST /api/descargar`: devuelve Excel ordenado (endpoint legacy, la descarga ahora se hace en frontend)
- `GET /api/health`: health check

### Assets
- Favicon: pin SVG negro con fondo blanco (`src/app/icon.svg`)
- Google Maps icon oficial 2026 (`public/google-maps-icon.png`) — usado en sección Steps
- Iconos custom SVG: MapPin, RouteLine, ExcelIcon, DownloadIcon

### Nombre
- Renombrado de "Organiza Destinos" a **"Destinos Oposiciones"** en toda la app

### Pendiente
- Deploy en Railway (dos servicios: frontend + backend)
- Commit inicial del repositorio
