/**
 * Genera `public/nucleos.json`: los núcleos de población de España que **no son**
 * municipios — pedanías, barriadas, entidades locales menores.
 *
 * Existe porque los listados de adjudicación no respetan la división municipal.
 * Un centro no está en "Roquetas de Mar": está en El Alquián, en Campanillas, en
 * Torre del Mar, en El Rocío. En el Excel de ejemplo son 44 de 642 filas (un 7%)
 * que el listado del INE no puede resolver por definición, y que la Geocoding API
 * de Google sí resolvía.
 *
 * Va en un fichero aparte **a propósito**: pesa varias veces más que el de
 * municipios y la mayoría de listados no lo necesita, así que solo se descarga
 * cuando alguna fila se queda sin resolver.
 *
 * Los nodos de OSM no traen código INE, así que aquí no hay provincia. La
 * desambiguación se hace en el cliente por cercanía geográfica (ver `nucleos.ts`).
 *
 * Uso: `node scripts/build-nucleos.mjs` (requiere municipios.json ya generado)
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const INSTANCIAS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

/**
 * Salida en CSV, no en JSON: de este dataset solo interesan el nombre y las
 * coordenadas, y pedir el JSON completo con todos los tags multiplica por diez lo
 * que hay que descargar para tirar el 90%.
 *
 * `isolated_dwelling` queda fuera: son casas de campo aisladas, decenas de miles,
 * y ningún listado de plazas destina a una.
 */
const QUERY = `
[out:csv(name,::lat,::lon;false)][timeout:900];
area["ISO3166-1"="ES"]["admin_level"="2"]->.es;
node(area.es)["place"~"^(town|village|hamlet|suburb|neighbourhood)$"]["name"];
out;
`;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** 4 decimales son ~11 m. Para situar una pedanía en un mapa de carreteras sobra. */
const redondea = (n) => Number(n.toFixed(4));

const normaliza = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function consultaOverpass() {
  let ultimoError;

  for (let intento = 0; intento < INSTANCIAS.length * 2; intento++) {
    const url = INSTANCIAS[intento % INSTANCIAS.length];
    console.log(`Consultando ${new URL(url).host}…`);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "destinosoposiciones/1.0 (build-nucleos.mjs)",
        },
        body: new URLSearchParams({ data: QUERY }),
      });

      if (res.ok) return await res.text();
      ultimoError = new Error(`respondió ${res.status}`);
    } catch (err) {
      ultimoError = err;
    }

    console.log(`  ${ultimoError.message}; reintentando en 15 s`);
    await espera(15_000);
  }

  throw new Error(`Overpass no respondió tras varios intentos: ${ultimoError.message}`);
}

async function main() {
  const csv = await consultaOverpass();
  const lineas = csv.split("\n").filter(Boolean);
  console.log(`${lineas.length} núcleos en bruto`);

  const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

  /**
   * **Aquí no se filtra por "ya es un municipio".** Se intentó, para ahorrar peso,
   * y borraba pedanías legítimas: como Sant Josep de sa Talaia (Ibiza) se llama
   * "San José" en castellano, desaparecían los 67 San José de España —incluido el
   * de Níjar, que es el que salía en el Excel—. Y lo mismo con Olivares: el
   * municipio está en Sevilla y la pedanía en Granada.
   *
   * Un nombre repetido no es un duplicado. La búsqueda ya consulta primero el
   * listado de municipios, así que tener el nombre en ambos ficheros no estorba.
   */
  const nucleos = [];
  const vistos = new Set();
  let duplicados = 0;

  for (const linea of lineas) {
    const [nombre, lat, lon] = linea.split("\t");
    if (!nombre || !lat || !lon) continue;

    const clave = normaliza(nombre);
    if (!clave) continue;

    // OSM repite el mismo núcleo en varios nodos; a 2 decimales (~1 km) es el mismo sitio.
    const huella = `${clave}|${Number(lat).toFixed(2)}|${Number(lon).toFixed(2)}`;
    if (vistos.has(huella)) {
      duplicados++;
      continue;
    }
    vistos.add(huella);

    nucleos.push([nombre, redondea(Number(lat)), redondea(Number(lon))]);
  }

  const destino = join(raiz, "public", "nucleos.json");
  const json = JSON.stringify({ nucleos });
  await writeFile(destino, json);

  console.log(`Descartados ${duplicados} duplicados`);
  console.log(`${nucleos.length} núcleos → public/nucleos.json (${Math.round(json.length / 1024)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
