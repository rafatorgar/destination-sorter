/**
 * El procesado completo de un listado, entero en el navegador.
 *
 * Es lo que antes hacía el endpoint `/api/procesar` del backend: leer el Excel,
 * situar cada destino y medir la distancia. Aquí está separado de la página para
 * que el componente siga siendo solo interfaz.
 *
 * La secuencia importa: **primero se sitúan todas las filas y después se piden
 * las distancias**. Situarlas es local e instantáneo, así que en cuanto termina ya
 * se sabe cuántos destinos hay de verdad y cuáles no se han podido localizar —y
 * eso es lo que permite enseñar un progreso honesto en vez de una barra que
 * avanza sobre un total que aún puede cambiar.
 */

import { calculaDistancias, type Distancia } from "./distancias";
import { leeExcel, type Fila } from "./excel";
import type { Lugar } from "./geo";
import { buscaMunicipio, cargaMunicipios, type Indice } from "./municipios";
import { buscaNucleo, cargaNucleos } from "./nucleos";

export interface Destino {
  municipio: string;
  provincia: string;
  /** Kilómetros por carretera. `Infinity` cuando no hay ruta o no se ha localizado. */
  distancia: number;
  /** `true` si el kilometraje es una estimación y no una ruta medida. */
  estimada: boolean;
  /** Por qué no tiene distancia, cuando no la tiene. */
  motivo?: "no-localizado" | "sin-ruta";
  /**
   * `true` mientras aún no le ha llegado el turno de medirse.
   *
   * Solo aparece en los avances intermedios, y existe para que la interfaz no
   * confunda "todavía no medido" con "no se ha podido medir": sin esta marca, a
   * mitad de proceso todos los destinos pendientes se pintaban como fallidos.
   */
  pendiente: boolean;
  data: Record<string, unknown>;
  coords?: { lat: number; lng: number } | null;
}

export interface Resultado {
  columnas: string[];
  origen: Lugar;
  destinos: Destino[];
}

export class ErrorProceso extends Error {}

/** Un destino que no se ha podido situar en el mapa. Conserva sus columnas. */
function sinLocalizar(fila: Fila): Destino {
  return {
    municipio: fila.municipio,
    provincia: fila.provincia,
    distancia: Infinity,
    estimada: false,
    motivo: "no-localizado",
    pendiente: false,
    data: fila.datos,
    coords: null,
  };
}

/**
 * Sitúa el municipio de origen que el usuario ha escrito a mano.
 *
 * Acepta "Montilla" y "Montilla, Córdoba": sin geocodificador que interprete la
 * frase, la coma es la forma de resolver los homónimos, que son 82.
 */
export function localizaOrigen(indice: Indice, texto: string): Lugar | null {
  const [nombre, provincia] = texto.split(",").map((p) => p.trim());
  return buscaMunicipio(indice, nombre, provincia);
}

export interface OpcionesProceso {
  /**
   * Se llama en cuanto se sabe cuántos destinos hay y cuáles son sus columnas,
   * antes de empezar a medir. Es lo que permite que la barra de progreso avance
   * sobre un total que ya no va a cambiar.
   */
  alEmpezar?: (info: { total: number; columnas: string[]; origen: Lugar }) => void;
  /** Se llama según van llegando las distancias, para poder pintar el progreso. */
  alAvanzar?: (destinos: Destino[]) => void;
  señal?: AbortSignal;
}

export async function procesaListado(
  archivo: File,
  textoOrigen: string,
  { alEmpezar, alAvanzar, señal }: OpcionesProceso = {}
): Promise<Resultado> {
  const [listado, municipios] = await Promise.all([leeExcel(archivo), cargaMunicipios()]);

  const origen = localizaOrigen(municipios, textoOrigen);
  if (!origen) throw new ErrorProceso("No se ha encontrado el municipio de origen");

  // 1. Situar cada fila en el listado de municipios.
  const situados = new Map<number, Lugar>();
  const pendientes: number[] = [];

  listado.filas.forEach((fila, i) => {
    const lugar = buscaMunicipio(municipios, fila.municipio, fila.provincia);
    if (lugar) situados.set(i, lugar);
    else pendientes.push(i);
  });

  /**
   * 2. Solo si algo se ha quedado fuera se baja el listado de núcleos de
   * población: es un fichero de ~1 MB y la mayoría de listados no lo necesita.
   * Si no llega a descargarse, esas filas se quedan sin localizar, que es
   * exactamente lo que habría pasado sin él.
   */
  if (pendientes.length) {
    try {
      const nucleos = await cargaNucleos();
      for (const i of pendientes) {
        const fila = listado.filas[i];
        const lugar = buscaNucleo(nucleos, municipios, fila.municipio, fila.provincia);
        if (lugar) situados.set(i, lugar);
      }
    } catch {
      // sin núcleos: las filas pendientes se quedan como no localizadas
    }
  }

  // 3. Medir. Solo se pregunta por lo que se ha podido situar.
  const indices = [...situados.keys()].sort((a, b) => a - b);
  const lugares = indices.map((i) => situados.get(i)!);

  alEmpezar?.({ total: listado.filas.length, columnas: listado.columnas, origen });

  const componDestinos = (distancias: Distancia[]): Destino[] => {
    const medidos = indices.map((indice, j): Destino => {
      const fila = listado.filas[indice];
      const lugar = lugares[j];
      const d = distancias[j];

      return {
        municipio: fila.municipio || lugar.nombre,
        provincia: fila.provincia || lugar.provincia,
        distancia: d?.km ?? Infinity,
        estimada: d?.estimada ?? false,
        motivo: d?.sinRuta ? "sin-ruta" : undefined,
        pendiente: d?.km == null && !d?.sinRuta,
        data: fila.datos,
        coords: { lat: lugar.lat, lng: lugar.lng },
      };
    });

    const noLocalizados = listado.filas
      .map((fila, i) => (situados.has(i) ? null : sinLocalizar(fila)))
      .filter((d): d is Destino => d !== null);

    return [...medidos, ...noLocalizados];
  };

  const distancias = await calculaDistancias(origen, lugares, {
    señal,
    alAvanzar: (_, parciales) => alAvanzar?.(componDestinos(parciales)),
  });

  return { columnas: listado.columnas, origen, destinos: componDestinos(distancias) };
}
