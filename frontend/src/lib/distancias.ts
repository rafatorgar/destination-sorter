/**
 * Distancias por carretera desde el navegador, sin API key y sin coste.
 *
 * Reemplaza a la Distance Matrix API de Google. El motor es **Valhalla**, la
 * instancia pública de OpenStreetMap: gratis, sin clave y sin cuota por usuario.
 *
 * ## El límite que condiciona todo el diseño
 *
 * El endpoint de matriz de la instancia pública **rechaza cualquier petición que
 * contenga un trayecto de más de 400 km** (`error_code 154`). Y no descarta ese
 * par: devuelve 400 y tira **el lote entero**. Un solo destino lejano dejaría sin
 * distancia a los 99 cercanos que iban con él.
 *
 * De ahí las dos decisiones de este módulo:
 *
 * 1. **Filtrar por línea recta antes de preguntar.** Solo van a la matriz los
 *    destinos a menos de 300 km en recta — con la sinuosidad típica española
 *    (~1,2×) es el margen que mantiene el trayecto por debajo de los 400 km.
 * 2. **Estimar los lejanos** a partir de la distancia en recta. Y no con una
 *    constante inventada: con el factor de sinuosidad **medido en este mismo
 *    listado** (ver `factorSinuosidad`).
 *
 * Es una degradación honesta: los destinos cercanos —que son entre los que
 * realmente se elige— llevan kilómetros de carretera exactos, y a 500 km da igual
 * un 5% de error porque nadie decide su vida por esa diferencia. Los estimados se
 * marcan como tales para que la interfaz pueda distinguirlos.
 */

import { distanciaKm, type Lugar } from "./geo";

const ENDPOINT = "https://valhalla1.openstreetmap.de/sources_to_targets";

/**
 * Destinos por petición. Se han probado 200 en 3,9 s contra la instancia pública;
 * 100 deja margen para no castigar un servidor que se mantiene con donaciones.
 */
const TAMANO_LOTE = 100;

/**
 * Radio en línea recta por debajo del cual se pide ruta real, en km.
 *
 * No son los 400 km del límite: son 400 descontando la sinuosidad. Si aun así
 * algún lote se pasa, `pideLote` lo parte y reintenta, así que el número no tiene
 * que ser exacto — solo prudente.
 */
const RADIO_MATRIZ = 300;

/** Sinuosidad de reserva cuando no hay ni un tramo medido del que deducirla. */
const FACTOR_POR_DEFECTO = 1.2;

/**
 * Banda en la que se acota la sinuosidad medida. Por debajo de 1,1 no hay
 * carretera que valga (la recta es una cota inferior) y por encima de 1,45 lo que
 * hay es un listado con cuatro destinos de montaña, no un dato del que extrapolar.
 */
const FACTOR_MINIMO = 1.1;
const FACTOR_MAXIMO = 1.45;

/**
 * Territorios que no están unidos por carretera al resto. Entre dos grupos
 * distintos no hay ruta posible, así que ni se pregunta ni se estima.
 *
 * Sin esto, a un opositor de Cáceres se le presentaban "2.108 km" hasta Granadilla
 * de Abona: la línea recta por el Atlántico multiplicada por la sinuosidad de las
 * carreteras extremeñas. Un número con toda la pinta de ser correcto y que no
 * significa absolutamente nada.
 */
const GRUPOS_INSULARES: Record<string, string> = {
  "07": "baleares",
  "35": "las-palmas",
  "38": "tenerife",
  "51": "ceuta",
  "52": "melilla",
};

const grupoTerritorial = (l: Lugar) => GRUPOS_INSULARES[l.codigoProvincia] ?? "peninsula";

export interface Distancia {
  /** Kilómetros por carretera. `null` cuando no existe ruta posible. */
  km: number | null;
  /** `true` si sale de estimar sobre la línea recta en vez de una ruta real. */
  estimada: boolean;
  /** `true` cuando origen y destino no están conectados por carretera. */
  sinRuta: boolean;
}

/** Distancia en línea recta entre dos lugares, en kilómetros. */
export const haversine = (a: Lugar, b: Lugar) => distanciaKm(a.lat, a.lng, b.lat, b.lng);

interface ParValhalla {
  distance?: number;
}

/**
 * Pide una matriz de 1 origen × N destinos.
 *
 * Si Valhalla rechaza el lote por exceso de distancia, lo parte por la mitad y
 * reintenta. Así un destino lejano que se haya colado solo se pierde a sí mismo,
 * y no arrastra al resto del lote. Al llegar a un único destino, se rinde y
 * devuelve `null` para que el llamante lo estime.
 */
async function pideLote(
  origen: Lugar,
  destinos: Lugar[],
  señal?: AbortSignal
): Promise<(ParValhalla | null)[]> {
  const cuerpo = {
    sources: [{ lat: origen.lat, lon: origen.lng }],
    targets: destinos.map((d) => ({ lat: d.lat, lon: d.lng })),
    costing: "auto",
    units: "kilometers",
  };

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: señal,
    });
  } catch (err) {
    if (señal?.aborted) throw err;
    return destinos.map(() => null); // sin red: que lo estime el llamante
  }

  if (res.ok) {
    const datos = await res.json();
    return datos.sources_to_targets?.[0] ?? destinos.map(() => null);
  }

  if (destinos.length === 1) return [null];

  const mitad = Math.ceil(destinos.length / 2);
  const [a, b] = await Promise.all([
    pideLote(origen, destinos.slice(0, mitad), señal),
    pideLote(origen, destinos.slice(mitad), señal),
  ]);
  return [...a, ...b];
}

/**
 * El factor por el que un trayecto real supera a la línea recta.
 *
 * Se calcula con la **mediana** de los tramos ya medidos de este listado, no con
 * una constante: la sinuosidad de Cuenca no es la de la meseta, y un listado
 * suele concentrarse en una zona. La mediana, y no la media, porque un par con
 * una ruta rara no debe arrastrar a los demás.
 */
function factorSinuosidad(medidos: { recta: number; carretera: number }[]): number {
  const ratios = medidos
    .filter((m) => m.recta > 5) // por debajo de 5 km el cociente se dispara y no dice nada
    .map((m) => m.carretera / m.recta)
    .sort((a, b) => a - b);

  if (!ratios.length) return FACTOR_POR_DEFECTO;

  const mediana = ratios[Math.floor(ratios.length / 2)];
  return Math.min(FACTOR_MAXIMO, Math.max(FACTOR_MINIMO, mediana));
}

interface Calibracion {
  recta: number;
  ratio: number;
}

/**
 * Mide con rutas reales cuánto supera la carretera a la línea recta, a distintas
 * distancias.
 *
 * El endpoint `/route` sí resuelve trayectos largos —el límite de 400 km es solo
 * de la matriz—, así que se piden **tres** repartidas por el rango a estimar.
 *
 * Y devuelve las tres por separado, no su media, porque **la sinuosidad no es una
 * constante: baja con la distancia**. Un trayecto de 300 km por comarcales
 * extremeñas da 1,45; los mismos 850 km hasta Girona, que se hacen por autovía,
 * dan 1,27. Promediarlas fue exactamente el error de la primera versión: aplicar
 * la sinuosidad de los tramos cortos a los largos inflaba Girona un 12%.
 */
async function calibraLargaDistancia(
  origen: Lugar,
  muestras: { destino: Lugar; recta: number }[],
  señal?: AbortSignal
): Promise<Calibracion[]> {
  const rutas = await Promise.all(
    muestras.map(async ({ destino, recta }): Promise<Calibracion | null> => {
      try {
        const res = await fetch("https://valhalla1.openstreetmap.de/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locations: [
              { lat: origen.lat, lon: origen.lng },
              { lat: destino.lat, lon: destino.lng },
            ],
            costing: "auto",
            units: "kilometers",
          }),
          signal: señal,
        });
        if (!res.ok) return null;
        const km = (await res.json()).trip?.summary?.length;
        return km && recta > 0 ? { recta, ratio: km / recta } : null;
      } catch {
        return null;
      }
    })
  );

  return rutas.filter((r): r is Calibracion => r != null);
}

/**
 * Estima los kilómetros de carretera para una distancia en recta.
 *
 * Usa el ratio de la calibración tomada a una distancia más parecida. Con tres
 * muestras repartidas por el rango, cada destino se estima con la sinuosidad del
 * tipo de trayecto que le corresponde en vez de con una media que no describe a
 * ninguno.
 */
function estima(recta: number, calibraciones: Calibracion[], respaldo: number): number {
  if (!calibraciones.length) return recta * respaldo;

  const cercana = calibraciones.reduce((mejor, c) =>
    Math.abs(c.recta - recta) < Math.abs(mejor.recta - recta) ? c : mejor
  );
  return recta * cercana.ratio;
}

/** Tres destinos repartidos por el rango a estimar: el más cercano, el mediano y el más lejano. */
function muestrasParaCalibrar<T>(ordenados: T[]): T[] {
  if (ordenados.length <= 3) return ordenados;
  return [ordenados[0], ordenados[Math.floor(ordenados.length / 2)], ordenados[ordenados.length - 1]];
}

export interface OpcionesCalculo {
  /**
   * Se llama al terminar cada lote con lo calculado hasta el momento, en el mismo
   * orden que los destinos. Las posiciones aún sin resolver llegan con `km` nulo.
   *
   * Recibe la lista entera y no solo un contador porque la interfaz va mostrando
   * los destinos según caen, no una barra a ciegas.
   */
  alAvanzar?: (resueltos: number, parciales: Distancia[]) => void;
  señal?: AbortSignal;
}

/**
 * Calcula la distancia desde `origen` a cada destino, en el mismo orden.
 *
 * Los destinos cercanos se resuelven por carretera contra Valhalla; los lejanos
 * (y los que Valhalla no sepa resolver) se estiman desde la línea recta.
 */
export async function calculaDistancias(
  origen: Lugar,
  destinos: Lugar[],
  { alAvanzar, señal }: OpcionesCalculo = {}
): Promise<Distancia[]> {
  const rectas = destinos.map((d) => haversine(origen, d));
  const grupoOrigen = grupoTerritorial(origen);

  const resultado: Distancia[] = destinos.map((d) => ({
    km: null,
    estimada: true,
    sinRuta: grupoTerritorial(d) !== grupoOrigen,
  }));

  const cercanos = destinos
    .map((_, i) => i)
    .filter((i) => !resultado[i].sinRuta && rectas[i] <= RADIO_MATRIZ);

  const medidos: { recta: number; carretera: number }[] = [];
  let resueltos = destinos.length - cercanos.length;

  for (let inicio = 0; inicio < cercanos.length; inicio += TAMANO_LOTE) {
    const lote = cercanos.slice(inicio, inicio + TAMANO_LOTE);
    const pares = await pideLote(origen, lote.map((i) => destinos[i]), señal);

    lote.forEach((indice, j) => {
      const par = pares[j];
      if (par?.distance != null) {
        resultado[indice] = {
          km: Math.round(par.distance * 10) / 10,
          estimada: false,
          sinRuta: false,
        };
        medidos.push({ recta: rectas[indice], carretera: par.distance });
      }
    });

    resueltos += lote.length;
    alAvanzar?.(resueltos, [...resultado]);
  }

  // Los que quedan sin ruta real hay que estimarlos: primero, con qué factor.
  const porEstimar = destinos
    .map((destino, i) => ({ destino, i, recta: rectas[i] }))
    .filter(({ i }) => resultado[i].km == null && !resultado[i].sinRuta)
    .sort((a, b) => a.recta - b.recta);

  const calibraciones = porEstimar.length
    ? await calibraLargaDistancia(origen, muestrasParaCalibrar(porEstimar), señal)
    : [];
  const respaldo = factorSinuosidad(medidos);

  for (const { i } of porEstimar) {
    resultado[i] = {
      km: Math.round(estima(rectas[i], calibraciones, respaldo) * 10) / 10,
      estimada: true,
      sinRuta: false,
    };
  }

  return resultado;
}
