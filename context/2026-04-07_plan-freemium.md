# Sesión 2026-04-07 — Plan freemium + Analytics de uso

## 2026-04-07

### Problema
Google Maps da ~40K elementos gratuitos/mes ($200 crédito). Cada subida de 600 destinos consume ~1.201 llamadas (600 geocoding + 600 distance matrix + 1 geocoding origen). Solo aguanta ~33 subidas/mes. Si el tráfico crece, se dispara el coste.

### Plan: modelo freemium

| | **Gratis** | **Premium** |
|---|---|---|
| Distancia | Línea recta (Haversine) | En coche (Google Maps) |
| Tabla ordenada | ✅ | ✅ |
| Mapa interactivo | ❌ | ✅ |
| Coste API por subida | 0 | ~1.201 llamadas |

### Pasos de implementación
1. **Base local de municipios españoles** — Descargar dataset del INE (~8.131 municipios) con coordenadas lat/lng. Elimina toda dependencia de Geocoding API para el modo gratis.
2. **Haversine en backend** — Cálculo de distancia en línea recta entre coordenadas. Gratis, sin API. Menos preciso que conducción pero suficiente para ordenar por cercanía.
3. **Cache de geocoding** — Para el modo premium, cachear resultados de geocoding en JSON/SQLite para no repetir llamadas en municipios ya resueltos.
4. **Toggle en frontend** — Selector de modo gratis vs premium antes de procesar.
5. **Pasarela de pago** — Stripe, Ko-fi u otra opción para desbloquear premium.

### Estado
🔲 Pendiente — solo planificado, no empezado.

---

### Evento de Analytics para medir uso real

Se añadió un evento de Google Analytics (`procesar_excel_completado`) que se dispara cuando un usuario termina de procesar un Excel. Parámetros: `municipio_origen` y `total_destinos`.

**Archivos modificados:**
- `frontend/src/app/herramienta/page.tsx` — evento `gtag` al recibir `event.type === "done"`
- `frontend/src/types/gtag.d.ts` — declaración de tipo para `window.gtag`

**Dónde verlo:** GA4 > Informes > Interacción > Eventos (o Tiempo real para probar).
