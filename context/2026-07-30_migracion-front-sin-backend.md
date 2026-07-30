# Sesión 2026-07-30 — Migración a front puro: fuera Railway y fuera Google Maps

## Punto de partida

La app necesitaba dos cosas de pago o de servidor: un backend FastAPI en Railway
(que leía el Excel con pandas) y la API de Google Maps (geocoding + distance
matrix). Cada listado de 600 destinos gastaba ~1.201 llamadas, así que el crédito
gratuito aguantaba unas 33 subidas al mes.

Revisando `trip-studio` —que hace rutas y mapas sin API key— se vio que todas las
piezas tenían equivalente gratuito. Se migra la app entera al navegador.

## Qué sustituye a qué

| Antes (backend Python) | Ahora (en el navegador) |
|---|---|
| `pandas` + `openpyxl` | SheetJS (`xlsx` 0.20.3, del CDN oficial) |
| `gmaps.geocode()` | `public/municipios.json`, generado desde OpenStreetMap |
| `gmaps.distance_matrix()` | Valhalla público de OSM (`sources_to_targets`) |
| Streaming NDJSON del backend | Callbacks de progreso en `lib/procesa.ts` |

El mapa ya usaba tiles de CARTO, que son gratis y sin clave: no se ha tocado.

## Las tres decisiones que costaron trabajo

### 1. El límite de 400 km de la matriz de Valhalla

La instancia pública rechaza cualquier petición que **contenga** un trayecto de
más de 400 km (`error_code 154`), y tira el lote entero, no solo ese par. Por eso
`lib/distancias.ts` filtra por línea recta antes de preguntar (300 km) y parte el
lote en dos si aun así lo rechazan.

Los que quedan fuera se estiman. Extrapolar la sinuosidad de los tramos cortos
daba un 8-13% de error, porque 800 km se hacen por autovía y 200 por comarcales.
Se corrigió midiendo **tres rutas reales** con el endpoint `/route` (que sí admite
larga distancia) y estimando cada destino con la muestra de distancia más
parecida: el error bajó a 0-4%.

### 2. Los destinos insulares

Sin regla explícita, a un opositor de Cáceres se le calculaban "2.108 km" hasta
Granadilla de Abona: la línea recta por el Atlántico multiplicada por la
sinuosidad extremeña. Ahora Baleares, Canarias, Ceuta y Melilla se detectan por
código INE de provincia y salen como "sin ruta por carretera".

### 3. Reconocer los nombres del Excel

Situar 8.133 municipios es fácil; reconocer cómo los escribe la administración,
no. `lib/municipios.ts` prueba en cascada: forma exacta → misma huella de palabras
(para "Villanueva de Mesía" vs el oficial "Villanueva Mesía") → sin espacios
(`TORREDELCAMPO`) → una sola errata, **y solo dentro de la provincia**.

Dos bugs que se encontraron probando contra el Excel de ejemplo real:

- Con tolerancia de dos erratas, "CALAHONDA (Granada)" —pedanía de Motril— caía en
  "La Calahorra", 90 km al norte. Se bajó a una.
- Se aceptaba el candidato único **sin mirar la provincia**: "AGUADULCE (ALMERIA)"
  acababa en Aguadulce de Sevilla y "MOGÁN (JAÉN)" en Las Palmas. Ahora la
  provincia manda siempre que se reconozca.

Aun así, el 7% de las filas no son municipios sino pedanías (El Alquián,
Campanillas, El Rocío). Se añadió un segundo dataset, `nucleos.json`, con los
79.853 núcleos de población de OSM, **descargado solo si alguna fila se queda sin
resolver** porque pesa ~1 MB comprimido. La provincia se desambigua por cercanía,
usando el centro y el radio de cada provincia calculados del listado de
municipios.

Al construirlo se descartaban los nombres que ya eran de un municipio, para
ahorrar peso. Era un error: como Sant Josep de sa Talaia se llama "San José" en
castellano, desaparecían los 67 San José de España, incluido el de Níjar.

## Resultado medido (Excel de ejemplo, 642 filas)

| | Antes | Ahora |
|---|---|---|
| Filas localizadas | — | **636 / 642 (99,1%)** |
| Tiempo de proceso | — | **9,2 s** |
| Llamadas a API de pago | ~1.201 | **0** |
| El Excel sale del equipo | Sí | **No** |

Las 6 filas restantes son erratas del propio listado (AGUALDULCE, GUALDALCACÍN,
SANTACRUZ). Las distancias estimadas se marcan con `≈` en la tabla.

## Ficheros nuevos

```
frontend/scripts/build-municipios.mjs   # genera public/municipios.json (8.133, ~145 KB gz)
frontend/scripts/build-nucleos.mjs      # genera public/nucleos.json (79.853, ~1 MB gz)
frontend/src/lib/geo.ts                 # distancia haversine y el tipo Lugar
frontend/src/lib/municipios.ts          # búsqueda de municipios en cascada
frontend/src/lib/nucleos.ts             # segunda pasada, carga diferida
frontend/src/lib/distancias.ts          # cliente de Valhalla
frontend/src/lib/excel.ts               # lectura de Excel en cliente
frontend/src/lib/procesa.ts             # orquestador del procesado
frontend/public/_headers                # cache de los datasets en Cloudflare Pages
```

## Estado del despliegue

🔲 **Pendiente**: crear el proyecto en Cloudflare Pages y apuntar el DNS.

El backend y los `Procfile` **siguen en el repo a propósito**: la web en
producción todavía se sirve desde Railway, y el frontend nuevo ya no le llama. Hay
que borrarlos cuando Cloudflare esté sirviendo el dominio, no antes.

Configuración para Cloudflare Pages:

- Directorio raíz: `frontend`
- Comando de build: `npm run build`
- Directorio de salida: `out`
- Variables de entorno: **ninguna**

## Consecuencia para el plan freemium

El plan de `2026-04-07_plan-freemium.md` queda sin sentido tal cual estaba: nació
para contener el coste de la API de Google, y ahora el coste es cero. Si se quiere
monetizar, hay que apoyarlo en otra cosa.
