# Changelog — Destinos Oposiciones

## 2026-03-28 — Sesión 2: Mejoras UI + Deploy en Railway

### Nuevas funcionalidades
- **Botón "Invítame a un café"** en resultados: enlaza a ko-fi.com/rafatorresgarcia, con icono de taza SVG, fondo marrón pastel y borde marrón. Aparece solo cuando los resultados están listos
- **Buscador de municipios** en la tabla de resultados: filtro en tiempo real por nombre de municipio, con contador actualizado
- **Botón "Descargar CSV" ahora es primario** (negro sólido), reordenados: Nueva consulta → Café → Descargar CSV (de izq a der)

### Mejoras visuales
- **Hero con efecto blur**: título, subtítulo y botón CTA entran desenfocados (blur 12px) y se resuelven a foco nítido en cascada
- **Steps rediseñados**: ilustraciones isométricas tipo Linear (fondo oscuro #111, líneas finas blancas) para cada paso:
  - Excel: documento isométrico con filas y flecha de upload animada
  - Municipio: pin sobre plataforma hexagonal con pulsos
  - Descarga: barras 3D ordenadas con etiquetas km y flecha de descarga
- **Animación cíclica en Steps**: los 3 pasos se activan secuencialmente cada 3s, con barra de progreso lineal. Hover activa un paso manualmente
- **Textos de Steps simplificados**: descripciones más concisas
- **Radar de resultados**: ahora solo aparece cuando el procesamiento termina (no durante)

### Deploy
- **Railway configurado** con dos servicios: frontend + backend
- **Dominio personalizado**: `destinosoposiciones.rafatorresgarcia.com`
- **DNS en Cloudflare**: CNAME + TXT de verificación (nube gris / DNS only)
- Backend Procfile actualizado con puerto dinámico `${PORT:-8000}`
- Añadido `python-dotenv` a requirements.txt
- Añadido `runtime.txt` (Python 3.11.9)

### Infraestructura
- **Railway CLI** instalado via Homebrew
- URLs de Railway:
  - Frontend: `frontend-production-1e891.up.railway.app`
  - Backend: `backend-production-caf0.up.railway.app`
- Variables de entorno en Railway:
  - Backend: `GOOGLE_MAPS_API_KEY`
  - Frontend: `NEXT_PUBLIC_BACKEND_URL` → URL del backend

### SEO técnico
- **`sitemap.xml`** generado dinámicamente con todas las páginas (landing, herramienta, blog, posts)
- **`robots.txt`** con allow all y referencia al sitemap
- **Metadata completa**: canonical URLs, OpenGraph con siteName/URL, Twitter card, keywords ampliadas, título con template
- **JSON-LD**: schema `WebApplication` (herramienta gratuita, autor) + schema `FAQPage` global + FAQPage por post de blog
- **Google Analytics**: G-BYQ8584M7S configurado con `next/script` strategy `afterInteractive`
- **Metadata por página**: /herramienta tiene título y descripción propios

### Blog
- **3 artículos SEO** prerenderizados como HTML estático:
  - "Cómo elegir destino en unas oposiciones: guía práctica"
  - "Cómo ordenar las plazas de tu oposición por distancia desde casa"
  - "Bolsa de interinos: cómo encontrar las plazas más cercanas a tu casa"
- **Página /blog** con listado, estilo minimalista con separadores dashed
- **FAQs específicas por post** en Accordion (mismo layout que landing: bordes dashed laterales + gap + CTA)
- **JSON-LD FAQPage** generado por cada post
- **Navegación prev/next** entre posts
- **Link "Blog" en el header**
- Para añadir posts: editar `src/lib/posts.ts`

### Mapa real de destinos
- **Backend**: nueva función `geocode_municipio()` usando Geocoding API de Google Maps
- Stream ahora devuelve `origen_coords` (lat/lng) y `coords` por cada destino
- **Frontend**: componente `ResultsMap` con Leaflet + tiles CartoDB Positron (grises minimalistas)
- Carga dinámica (`dynamic import`) para evitar problemas SSR
- Origen: círculo blanco con borde negro + anillo dashed + popup abierto
- Destinos: círculos con tamaño/opacidad proporcional a cercanía
- Auto-fit para mostrar todos los puntos
- Se muestra debajo del radar cuando los resultados terminan
- **Requiere Geocoding API habilitada** en Google Cloud Console

### Radar mejorado
- Nombres de municipios y distancias visibles siempre (sin necesidad de hover)
- Hover destaca el punto y el texto
- Fix: keys únicos para evitar warnings con municipios repetidos

### Landing — Features actualizadas
- **4 features** (antes 3): Radar (filtro 20 cercanos) + Mapa real + Tabla + Descarga
- Layout alternado consistente: izq-der / der-izq / izq-der / der-izq
- Visual del mapa usa silueta de Córdoba (basada en geografía real) sobre fondo negro
- **CTAs contextuales** en cada feature: "Ver mis destinos cercanos", "Obtener mi mapa", "Ordenar mis plazas", "Descargar mi listado"
- **CTA tras los pasos**: "Probarlo ahora"

### Notas
- IONOS no permite CNAME + TXT en el mismo subdominio → DNS movido a Cloudflare
- Cloudflare proxy debe estar en "DNS only" (nube gris) para que Railway verifique y genere SSL
- El puerto del custom domain en Railway debe coincidir con el del servicio (8080, no 3000)
- `NEXT_PUBLIC_BACKEND_URL` debe incluir `https://` y sin espacios (se inyecta en build time)
- Python 3.9 no soporta `dict | None` — usar sin type hint
