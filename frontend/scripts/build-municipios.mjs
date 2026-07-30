/**
 * Genera `public/municipios.json`: los municipios de España con su centroide.
 *
 * Sustituye a la Geocoding API de Google. El dominio del problema es cerrado —un
 * listado de destinos solo contiene municipios españoles—, así que no hace falta
 * geocodificación libre: con el listado completo embebido, resolver un municipio
 * es una búsqueda en memoria, instantánea y sin coste.
 *
 * Fuente: OpenStreetMap vía Overpass. Se piden las relaciones administrativas de
 * `admin_level=8`, que en España son exactamente los municipios.
 *
 * **El filtro es `ine:municipio`, no el nombre.** Entre las relaciones de nivel 8
 * aparecen ~128 entidades que no son municipios: mancomunidades, facerías navarras,
 * comunidades de villa y tierra ("Comunidad de Villoruebo y Torrelara", "Bardenas
 * Reales"). Ninguna tiene código INE, así que exigirlo las descarta sin listas negras.
 *
 * Y del código sale la provincia gratis: sus dos primeros dígitos la identifican, lo
 * que evita un cruce espacial con los límites provinciales.
 *
 * Uso: `node scripts/build-municipios.mjs`
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Instancias públicas de Overpass. Son servidores comunitarios y bajo carga
 * devuelven 429 o 504 sin más: se reintenta y se rota de instancia. Esto solo
 * corre a mano cuando se regenera el dataset, así que la lentitud da igual.
 */
const INSTANCIAS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const QUERY = `
[out:json][timeout:900];
area["ISO3166-1"="ES"]["admin_level"="2"]->.es;
rel(area.es)["boundary"="administrative"]["admin_level"="8"];
out center tags;
`;

/** Códigos INE de provincia (01–52). Cualquier otro prefijo no es una provincia real. */
const PROVINCIAS = {
  "01": "Álava",
  "02": "Albacete",
  "03": "Alicante",
  "04": "Almería",
  "05": "Ávila",
  "06": "Badajoz",
  "07": "Baleares",
  "08": "Barcelona",
  "09": "Burgos",
  10: "Cáceres",
  11: "Cádiz",
  12: "Castellón",
  13: "Ciudad Real",
  14: "Córdoba",
  15: "A Coruña",
  16: "Cuenca",
  17: "Girona",
  18: "Granada",
  19: "Guadalajara",
  20: "Gipuzkoa",
  21: "Huelva",
  22: "Huesca",
  23: "Jaén",
  24: "León",
  25: "Lleida",
  26: "La Rioja",
  27: "Lugo",
  28: "Madrid",
  29: "Málaga",
  30: "Murcia",
  31: "Navarra",
  32: "Ourense",
  33: "Asturias",
  34: "Palencia",
  35: "Las Palmas",
  36: "Pontevedra",
  37: "Salamanca",
  38: "Santa Cruz de Tenerife",
  39: "Cantabria",
  40: "Segovia",
  41: "Sevilla",
  42: "Soria",
  43: "Tarragona",
  44: "Teruel",
  45: "Toledo",
  46: "Valencia",
  47: "Valladolid",
  48: "Bizkaia",
  49: "Zamora",
  50: "Zaragoza",
  51: "Ceuta",
  52: "Melilla",
};

/**
 * 5 decimales son ~1 m: de sobra para un centroide municipal, y recorta bastante
 * el peso del fichero frente a los 7 decimales que devuelve Overpass.
 */
const redondea = (n) => Number(n.toFixed(5));

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function consultaOverpass() {
  let ultimoError;

  for (let intento = 0; intento < INSTANCIAS.length * 2; intento++) {
    const url = INSTANCIAS[intento % INSTANCIAS.length];
    console.log(`Consultando ${new URL(url).host}…`);

    try {
      const res = await fetch(url, {
        method: "POST",
        // Overpass responde 406 a un User-Agent genérico: quiere saber quién le llama.
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "destinosoposiciones/1.0 (build-municipios.mjs)",
        },
        body: new URLSearchParams({ data: QUERY }),
      });

      if (res.ok) return (await res.json()).elements;
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
  const elements = await consultaOverpass();
  console.log(`${elements.length} relaciones de admin_level=8`);

  const municipios = [];
  const vistos = new Set();
  let sinIne = 0;
  let provinciaInvalida = 0;

  for (const el of elements) {
    const t = el.tags || {};
    const ine = t["ine:municipio"];

    if (!ine || !/^\d{5}$/.test(ine)) {
      sinIne++;
      continue;
    }
    if (!PROVINCIAS[ine.slice(0, 2)]) {
      provinciaInvalida++;
      continue;
    }
    if (vistos.has(ine) || !el.center) continue;
    vistos.add(ine);

    const nombre = t.name;
    if (!nombre) continue;

    /**
     * Los nombres alternativos no son un extra: media España tiene dos formas
     * (Girona/Gerona, A Coruña/La Coruña, Donostia/San Sebastián) y el Excel de
     * la administración puede traer cualquiera de ellas.
     *
     * `old_name:es` está aquí a propósito: es donde OSM guarda "Orense", "Lérida"
     * o "Gerona" cuando el nombre oficial pasó a ser el cooficial. Son
     * exactamente las formas que siguen apareciendo en los listados oficiales.
     */
    const alias = [
      t["name:es"],
      t["name:ca"],
      t["name:eu"],
      t["name:gl"],
      t["old_name:es"],
      t["alt_name"],
      t["alt_name:es"],
      t["official_name"],
      t["official_name:es"],
    ]
      /**
       * En los municipios bilingües el nombre viene fusionado —"Alacant / Alicante",
       * "Donostia/San Sebastián"—, así que se parte también por la barra: de otro
       * modo no coincide con ninguna de las dos formas por separado, que es como se
       * escriben en la práctica.
       */
      .flatMap((v) => (v ? v.split(/[;/]/) : []))
      .map((v) => v.trim())
      .filter((v) => v && v !== nombre);

    municipios.push([
      nombre,
      [...new Set(alias)].join("|"),
      ine,
      redondea(el.center.lat),
      redondea(el.center.lon),
      /**
       * La población solo sirve para ordenar sugerencias: al teclear "madri" el
       * primero tiene que ser Madrid, no Madrigueras. Sin ella el orden es el del
       * código INE, que es tanto como decir alfabético por provincia.
       */
      Number(t.population) || 0,
    ]);
  }

  municipios.sort((a, b) => a[2].localeCompare(b[2]));

  const salida = { provincias: PROVINCIAS, municipios };
  const destino = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "municipios.json");
  await writeFile(destino, JSON.stringify(salida));

  const kb = Math.round(JSON.stringify(salida).length / 1024);
  console.log(`Descartados: ${sinIne} sin código INE, ${provinciaInvalida} con provincia inexistente`);
  console.log(`${municipios.length} municipios → public/municipios.json (${kb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
