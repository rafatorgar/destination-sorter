/**
 * Segunda pasada para las filas que no son un municipio.
 *
 * Los listados de adjudicación no respetan la división municipal: destinan a El
 * Alquián, a Campanillas, a Torre del Mar, a El Rocío. Ninguno es un municipio y
 * por tanto ninguno está —ni puede estar— en el listado del INE.
 *
 * ## Por qué se carga aparte
 *
 * Son 79.000 núcleos y ~900 KB comprimidos, frente a los ~145 KB del listado de
 * municipios. La mayoría de listados no lo necesita, así que el fichero solo se
 * descarga cuando alguna fila se ha quedado sin resolver. Quien suba un Excel
 * limpio no paga ese peso.
 *
 * ## Por qué hace falta desambiguar por cercanía
 *
 * OSM no le pone código INE a estos nodos, así que el dataset no lleva provincia:
 * añadírsela habría exigido cruzar 79.000 puntos contra los límites provinciales.
 * Como el Excel sí trae la provincia, sale más barato hacerlo al revés — coger los
 * candidatos con ese nombre y quedarse con el que cae dentro de la provincia—,
 * usando el centro y el radio que ya se calculan del listado de municipios.
 */

import { distanciaKm, type Lugar } from "./geo";
import { codigoDeProvincia, normaliza, type Indice as IndiceMunicipios } from "./municipios";

type FilaCruda = [nombre: string, lat: number, lng: number];

export interface IndiceNucleos {
  porNombre: Map<string, FilaCruda[]>;
}

let indice: Promise<IndiceNucleos> | null = null;

/** Indexa el listado ya descargado. Separado del `fetch` para poder probarlo fuera del navegador. */
export function indexaNucleos(datos: { nucleos: FilaCruda[] }): IndiceNucleos {
  const porNombre = new Map<string, FilaCruda[]>();

  for (const fila of datos.nucleos) {
    const clave = normaliza(fila[0]);
    if (!clave) continue;
    const lista = porNombre.get(clave);
    if (lista) lista.push(fila);
    else porNombre.set(clave, [fila]);
  }

  return { porNombre };
}

/** Descarga el listado de núcleos. Solo debe llamarse si alguna fila lo necesita. */
export function cargaNucleos(): Promise<IndiceNucleos> {
  if (!indice) {
    indice = fetch("/nucleos.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la base de núcleos de población");
        return res.json();
      })
      .then(indexaNucleos)
      .catch((err) => {
        indice = null;
        throw err;
      });
  }
  return indice;
}

/**
 * Margen sobre el radio de la provincia, en km.
 *
 * El radio se mide desde el centro medio de los municipios, así que las esquinas
 * de una provincia quedan algo por fuera. Este margen las recupera sin llegar a
 * abarcar la provincia de al lado.
 */
const MARGEN = 25;

/**
 * Busca un núcleo de población por nombre, dentro de la provincia indicada.
 *
 * Sin provincia no se busca: "La Estación", "El Puerto" o "Santa Cruz" se repiten
 * por toda España, y aquí no hay ni códigos ni jerarquía con la que decidir. Un
 * destino colocado en la provincia equivocada es peor que uno sin colocar.
 */
export function buscaNucleo(
  nucleos: IndiceNucleos,
  municipios: IndiceMunicipios,
  nombre: string,
  provincia: string
): Lugar | null {
  if (!provincia) return null;

  const codigo = codigoDeProvincia(municipios, provincia);
  if (!codigo) return null;

  const extension = municipios.geoProvincia.get(codigo);
  if (!extension) return null;

  const candidatos = nucleos.porNombre.get(normaliza(nombre));
  if (!candidatos?.length) return null;

  const alcance = extension.radio + MARGEN;
  let mejor: FilaCruda | null = null;
  let mejorDistancia = Infinity;

  for (const candidato of candidatos) {
    const d = distanciaKm(extension.lat, extension.lng, candidato[1], candidato[2]);
    if (d <= alcance && d < mejorDistancia) {
      mejorDistancia = d;
      mejor = candidato;
    }
  }

  if (!mejor) return null;

  return {
    nombre: mejor[0],
    provincia: municipios.porProvincia.get(codigo)?.[0]?.provincia ?? provincia,
    codigoProvincia: codigo,
    lat: mejor[1],
    lng: mejor[2],
  };
}
