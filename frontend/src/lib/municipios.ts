/**
 * Resolver un municipio a coordenadas, en el navegador y sin llamar a nadie.
 *
 * Reemplaza a la Geocoding API de Google. El listado completo (8.133 municipios,
 * ~145 KB comprimidos) se descarga una vez y se indexa en memoria; a partir de ahí
 * resolver 600 destinos es instantáneo y gratis.
 *
 * El trabajo de verdad no son las coordenadas: es **reconocer el nombre**. Un Excel
 * de adjudicación escribe "CORUÑA (A)", "Palmas de Gran Canaria, Las" o "GERONA", y
 * las tres tienen que caer en el municipio correcto.
 */

import { distanciaKm, type Lugar } from "./geo";

export interface Municipio extends Lugar {
  /** Código INE de 5 dígitos. Identificador estable del municipio. */
  ine: string;
  /** Solo para ordenar sugerencias. 0 si OSM no la tiene. */
  poblacion: number;
  /**
   * Todas sus formas normalizadas (nombre, alias y variantes de artículo), ya
   * calculadas al indexar. Se guardan porque el autocompletado recorre los 8.133
   * municipios en cada tecla y normalizar sobre la marcha sí se nota.
   */
  formas: string[];
}

type FilaCruda = [
  nombre: string,
  alias: string,
  ine: string,
  lat: number,
  lng: number,
  poblacion: number,
];

interface DatosCrudos {
  provincias: Record<string, string>;
  municipios: FilaCruda[];
}

/**
 * Artículos que la administración pospone al nombre: "Coruña (A)", "Palmas, Las".
 * Incluye los de las lenguas cooficiales, que aparecen igual en los listados.
 */
const ARTICULOS = new Set(["el", "la", "los", "las", "a", "as", "o", "os", "l", "es", "sa", "ses", "s"]);

/**
 * Nombres de provincia que no coinciden con el oficial del INE. La columna
 * PROVINCIA del Excel llega en castellano tradicional tan a menudo como en la
 * forma cooficial, y ambas tienen que valer.
 */
const ALIAS_PROVINCIA: Record<string, string> = {
  alava: "01",
  araba: "01",
  alacant: "03",
  almeria: "04",
  "illes balears": "07",
  "islas baleares": "07",
  balears: "07",
  mallorca: "07",
  castello: "12",
  "la coruna": "15",
  coruna: "15",
  "a coruna": "15",
  gerona: "17",
  guipuzcoa: "20",
  gipuzkoa: "20",
  lerida: "25",
  rioja: "26",
  orense: "32",
  ourense: "32",
  oviedo: "33",
  "principado de asturias": "33",
  "las palmas": "35",
  "palmas de gran canaria": "35",
  tenerife: "38",
  "santander": "39",
  "valencia": "46",
  "valència": "46",
  vizcaya: "48",
  bizkaia: "48",
  "region de murcia": "30",
  "comunidad de madrid": "28",
  navarra: "31",
  nafarroa: "31",
};

/**
 * Quita tildes, mayúsculas y puntuación para que "CORUÑA (A)" y "A Coruña" se
 * puedan comparar. Descomponer en NFD y borrar los diacríticos convierte también
 * la eñe en "n", que es justo lo que interesa: los listados oficiales escriben
 * tanto "Begoña" como "Begona" según de dónde se haya exportado el fichero.
 */
export function normaliza(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Las formas bajo las que un mismo municipio puede aparecer escrito.
 *
 * Genera el nombre tal cual, el nombre con el artículo pospuesto traído al frente
 * ("coruna a" → "a coruna") y el nombre sin artículo ("coruna"). Y antes de todo
 * eso parte por la barra los nombres bilingües —"Alacant / Alicante"— porque en
 * un Excel real solo aparece una de las dos mitades.
 *
 * Se usa tanto al indexar como al buscar, así que da igual en qué forma esté
 * escrito cada lado.
 */
function variantes(nombre: string): string[] {
  const formas = new Set<string>();

  const partes = nombre.split("/");
  const textos = partes.length > 1 ? [nombre, ...partes] : [nombre];

  for (const texto of textos) {
    const base = normaliza(texto);
    if (!base) continue;

    formas.add(base);
    const palabras = base.split(" ");
    if (palabras.length < 2) continue;

    const ultima = palabras[palabras.length - 1];
    if (ARTICULOS.has(ultima)) {
      const sinArticulo = palabras.slice(0, -1).join(" ");
      formas.add(`${ultima} ${sinArticulo}`);
      formas.add(sinArticulo);
    }

    if (ARTICULOS.has(palabras[0])) {
      formas.add(palabras.slice(1).join(" "));
    }
  }

  return [...formas];
}

/**
 * Palabras de enlace que no distinguen a un municipio de otro. Se ignoran en la
 * segunda pasada de búsqueda: el INE llama "Villanueva Mesía" a lo que los
 * listados escriben "Villanueva de Mesía", y esa preposición no puede ser el
 * motivo de que un destino se quede sin ordenar.
 */
const ENLACES = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "i", "a", "o", "d"]);

/** La huella de un nombre: sus palabras con peso, ordenadas. Ignora orden y enlaces. */
function huella(nombre: string): string {
  const palabras = normaliza(nombre)
    .split(" ")
    .filter((p) => p && !ENLACES.has(p));
  return [...new Set(palabras)].sort().join(" ");
}

let indice: Promise<Indice> | null = null;

export interface Indice {
  /** Cada forma normalizada → los municipios que responden a ella. */
  porNombre: Map<string, Municipio[]>;
  /** Huella (palabras con peso, ordenadas) → municipios. Segunda pasada de búsqueda. */
  porHuella: Map<string, Municipio[]>;
  /** Nombre sin espacios → municipios. Para los listados que pegan las palabras. */
  porCompacto: Map<string, Municipio[]>;
  /** Código INE de provincia → sus municipios. Acota la búsqueda aproximada. */
  porProvincia: Map<string, Municipio[]>;
  /** Nombre de provincia normalizado → código INE de dos dígitos. */
  codigoProvincia: Map<string, string>;
  /** Extensión aproximada de cada provincia, para situar los núcleos de población. */
  geoProvincia: Map<string, ExtensionProvincia>;
  todos: Municipio[];
}

/**
 * Una provincia reducida a un centro y un radio.
 *
 * Es deliberadamente burdo: no sirve para decir dónde acaba la provincia, sino
 * para descartar que una pedanía llamada igual esté a 400 km. El radio se mide, no
 * se fija, porque Badajoz y Guipúzcoa no admiten el mismo número.
 */
export interface ExtensionProvincia {
  lat: number;
  lng: number;
  radio: number;
}

/** Indexa la base ya descargada. Separado del `fetch` para poder probarlo fuera del navegador. */
export function indexa(datos: DatosCrudos): Indice {
  const porNombre = new Map<string, Municipio[]>();
  const porHuella = new Map<string, Municipio[]>();
  const porCompacto = new Map<string, Municipio[]>();
  const porProvincia = new Map<string, Municipio[]>();
  const todos: Municipio[] = [];

  const apunta = (mapa: Map<string, Municipio[]>, clave: string, m: Municipio) => {
    const lista = mapa.get(clave);
    if (lista) lista.push(m);
    else mapa.set(clave, [m]);
  };

  for (const [nombre, alias, ine, lat, lng, poblacion] of datos.municipios) {
    const municipio: Municipio = {
      nombre,
      provincia: datos.provincias[ine.slice(0, 2)],
      codigoProvincia: ine.slice(0, 2),
      ine,
      lat,
      lng,
      poblacion,
      formas: [],
    };
    todos.push(municipio);

    const nombres = alias ? [nombre, ...alias.split("|")] : [nombre];
    const formas = new Set(nombres.flatMap(variantes));
    municipio.formas = [...formas];

    for (const forma of formas) {
      apunta(porNombre, forma, municipio);
      apunta(porCompacto, forma.replace(/ /g, ""), municipio);
    }
    for (const n of nombres) {
      const h = huella(n);
      if (h) apunta(porHuella, h, municipio);
    }
    apunta(porProvincia, ine.slice(0, 2), municipio);
  }

  const codigoProvincia = new Map<string, string>();
  for (const [codigo, nombre] of Object.entries(datos.provincias)) {
    for (const forma of variantes(nombre)) codigoProvincia.set(forma, codigo);
  }
  for (const [alias, codigo] of Object.entries(ALIAS_PROVINCIA)) {
    codigoProvincia.set(normaliza(alias), codigo);
  }

  const geoProvincia = new Map<string, ExtensionProvincia>();
  for (const [codigo, lista] of porProvincia) {
    const lat = lista.reduce((s, m) => s + m.lat, 0) / lista.length;
    const lng = lista.reduce((s, m) => s + m.lng, 0) / lista.length;
    const radio = lista.reduce((max, m) => Math.max(max, distanciaKm(lat, lng, m.lat, m.lng)), 0);
    geoProvincia.set(codigo, { lat, lng, radio });
  }

  return { porNombre, porHuella, porCompacto, porProvincia, codigoProvincia, geoProvincia, todos };
}

/** Descarga e indexa la base una sola vez, aunque se pida en paralelo. */
export function cargaMunicipios(): Promise<Indice> {
  if (!indice) {
    indice = fetch("/municipios.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la base de municipios");
        return res.json();
      })
      .then(indexa)
      .catch((err) => {
        indice = null; // que un fallo de red no deje la app sin base para siempre
        throw err;
      });
  }
  return indice;
}

/**
 * Busca un municipio por nombre, usando la provincia para desambiguar.
 *
 * Hay nombres repetidos por toda España —hay varios "Villanueva de la Vera" y
 * decenas de homónimos entre provincias—, y ahí la columna PROVINCIA del Excel es
 * la que decide. Sin ella y con ambigüedad se devuelve `null` en vez de adivinar:
 * un destino mal situado ordena la lista entera mal y nadie lo notaría.
 */
export function buscaMunicipio(
  indice: Indice,
  nombre: string,
  provincia?: string
): Municipio | null {
  const codigo = provincia ? codigoDeProvincia(indice, provincia) : null;

  /**
   * **La provincia manda siempre que se conozca, incluso con un solo candidato.**
   *
   * Aceptar el candidato único sin mirar la provincia parecía inofensivo y no lo
   * era: "AGUADULCE (ALMERIA)" —una barriada de Roquetas— caía en Aguadulce de
   * Sevilla, 250 km al oeste, y "MOGÁN (JAÉN)" se iba a Las Palmas, al otro lado
   * del Atlántico. En ambos casos el nombre era único en la base, así que no
   * había ambigüedad que detectar: solo un destino silenciosamente mal colocado.
   *
   * Si la provincia se reconoce y ningún candidato está en ella, es mejor no
   * resolver: la fila cae a la búsqueda de núcleos de población, que es donde
   * realmente vive ese nombre.
   */
  const resuelve = (candidatos: Municipio[] | undefined): Municipio | null => {
    if (!candidatos?.length) return null;
    if (!codigo) return candidatos.length === 1 ? candidatos[0] : null;

    const enProvincia = candidatos.filter((m) => m.ine.startsWith(codigo));
    return enProvincia.length === 1 ? enProvincia[0] : null;
  };

  // 1. Coincidencia exacta con alguna de sus formas.
  for (const forma of variantes(nombre)) {
    const encontrado = resuelve(indice.porNombre.get(forma));
    if (encontrado) return encontrado;
  }

  // 2. Misma huella: mismas palabras con peso, en cualquier orden y sin enlaces.
  const encontradoPorHuella = resuelve(indice.porHuella.get(huella(nombre)));
  if (encontradoPorHuella) return encontradoPorHuella;

  // 3. Sin espacios: "TORREDELCAMPO" es Torre del Campo, y esto no es adivinar.
  const compacto = resuelve(indice.porCompacto.get(normaliza(nombre).replace(/ /g, "")));
  if (compacto) return compacto;

  // 4. Aproximada, y solo dentro de la provincia (ver `buscaAproximado`).
  return codigo ? buscaAproximado(indice, nombre, codigo) : null;
}

/**
 * Último recurso: el municipio más parecido **dentro de la provincia indicada**.
 *
 * Los listados vienen tecleados a mano y traen erratas de verdad —"TORREPEROJIL"
 * por Torreperogil, "CORIA DEL RIA" por Coria del Río, "ALBAÑUELAS" por
 * Albuñuelas—. Descartar esas filas es peor que asumir el riesgo de acercarse.
 *
 * **Pero solo dentro de la provincia.** Sin esa restricción, "FACINAS (Cádiz)"
 * —que es una pedanía de Tarifa— cae en "Hacinas (Burgos)", a una letra de
 * distancia y a 700 km. Un destino colocado en la provincia equivocada es mucho
 * peor que un destino sin colocar: el segundo se ve, el primero no.
 */
function buscaAproximado(indice: Indice, nombre: string, codigo: string): Municipio | null {
  const consulta = normaliza(nombre);
  if (consulta.length < 4) return null;

  const candidatos = indice.porProvincia.get(codigo);
  if (!candidatos) return null;

  /**
   * **Una sola errata, nunca dos.** Con dos, "CALAHONDA (Granada)" —que es una
   * pedanía costera de Motril— caía en "La Calahorra", que está en el Marquesado
   * del Zenete, 90 km al norte y en la otra vertiente de Sierra Nevada. Dos
   * ediciones ya no son un dedazo: son otro pueblo.
   */
  const tolerancia = 1;

  let mejor: Municipio | null = null;
  let mejorDistancia = tolerancia + 1;

  for (const municipio of candidatos) {
    for (const forma of municipio.formas) {
      // "Peñarroya" por "Peñarroya-Pueblonuevo": el listado acorta el nombre compuesto.
      if (forma.startsWith(`${consulta} `)) return municipio;

      const d = distanciaEdicion(consulta, forma, mejorDistancia);
      if (d < mejorDistancia) {
        mejorDistancia = d;
        mejor = municipio;
      }
    }
  }

  return mejor;
}

/**
 * Distancia de edición, abandonando en cuanto se supera `tope`.
 *
 * El corte importa: esto se ejecuta contra todos los municipios de una provincia
 * por cada fila sin resolver, y sin él la comparación completa de cadenas largas
 * se nota en listados grandes.
 */
function distanciaEdicion(a: string, b: string, tope: number): number {
  if (Math.abs(a.length - b.length) >= tope) return tope;

  let previa = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimo = i;

    for (let j = 1; j <= b.length; j++) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      const valor = Math.min(previa[j] + 1, actual[j - 1] + 1, previa[j - 1] + coste);
      actual.push(valor);
      if (valor < minimo) minimo = valor;
    }

    if (minimo >= tope) return tope;
    previa = actual;
  }

  return previa[b.length];
}

/** El código INE de una provincia escrita como sea, o `null` si no se reconoce. */
export function codigoDeProvincia(indice: Indice, provincia: string): string | null {
  const texto = normaliza(provincia);
  if (/^\d{2}$/.test(texto)) return texto;

  const directo = indice.codigoProvincia.get(texto);
  if (directo) return directo;

  // "Provincia de Cádiz", "Cádiz (provincia)" y demás envoltorios.
  const limpio = texto.replace(/\b(provincia|de|del|la|el)\b/g, " ").replace(/\s+/g, " ").trim();
  return indice.codigoProvincia.get(limpio) ?? null;
}

/**
 * Sugerencias para el municipio de origen, que el usuario escribe a mano.
 *
 * Dos criterios, en este orden: primero los que **empiezan** por lo tecleado
 * (escribiendo "san" interesa "San Sebastián" antes que "El Puerto de Santa
 * María"), y dentro de cada grupo, los más poblados primero.
 *
 * Lo segundo no es un detalle: sin ello, teclear "madri" ofrece Madrigueras,
 * Madrigal y Madridejos —van por código INE, o sea alfabético por provincia— y
 * Madrid aparece el séptimo. Quien busca "madri" busca Madrid casi siempre.
 */
export function sugiereMunicipios(indice: Indice, texto: string, limite = 8): Municipio[] {
  const consulta = normaliza(texto);
  if (consulta.length < 2) return [];

  const empiezan: Municipio[] = [];
  const contienen: Municipio[] = [];

  for (const municipio of indice.todos) {
    // Se busca sobre todas sus formas: "donostia" y "san sebastian" valen igual.
    const { formas } = municipio;
    if (formas.some((f) => f.startsWith(consulta))) empiezan.push(municipio);
    else if (formas.some((f) => f.includes(consulta))) contienen.push(municipio);
  }

  const porPoblacion = (a: Municipio, b: Municipio) => b.poblacion - a.poblacion;
  empiezan.sort(porPoblacion);
  contienen.sort(porPoblacion);

  return [...empiezan, ...contienen].slice(0, limite);
}
