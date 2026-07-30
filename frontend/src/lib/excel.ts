/**
 * Lectura del Excel en el propio navegador.
 *
 * Reemplaza a pandas + openpyxl en el backend. Y de paso resuelve algo que antes
 * no tenía solución: **el fichero ya no sale del ordenador de quien lo sube**. Un
 * listado de adjudicación es un documento público, pero el destino que alguien
 * está mirando no lo es.
 */

export interface Fila {
  /** Todas las columnas del Excel, tal cual venían. */
  datos: Record<string, unknown>;
  municipio: string;
  provincia: string;
}

export interface Listado {
  columnas: string[];
  filas: Fila[];
}

/** La columna obligatoria: sin municipio no hay nada que ordenar. */
const COLUMNA_MUNICIPIO = "MUNICIPIO";
const COLUMNA_PROVINCIA = "PROVINCIA";

export class ErrorExcel extends Error {}

/**
 * Busca una columna sin exigir que las mayúsculas y los espacios cuadren.
 *
 * Los listados oficiales escriben la cabecera como les parece —"Municipio",
 * "MUNICIPIO ", "municipio"— y rechazar el fichero por un espacio de más sería
 * absurdo cuando la columna está delante.
 */
function localizaColumna(columnas: string[], buscada: string): string | null {
  const normalizada = buscada.trim().toLowerCase();
  return columnas.find((c) => c.trim().toLowerCase() === normalizada) ?? null;
}

/**
 * Lee un .xlsx o .xls y devuelve sus filas con todas las columnas intactas.
 *
 * SheetJS se importa aquí dentro, no arriba: son ~130 KB que solo hacen falta
 * cuando alguien sube un fichero, y cargarlos con la página penalizaba a todo el
 * que entra a leer y se va.
 */
export async function leeExcel(archivo: File): Promise<Listado> {
  const XLSX = await import("xlsx");

  let libro: ReturnType<typeof XLSX.read>;
  try {
    libro = XLSX.read(await archivo.arrayBuffer());
  } catch {
    throw new ErrorExcel("No se pudo leer el archivo Excel");
  }

  const hoja = libro.Sheets[libro.SheetNames[0]];
  if (!hoja) throw new ErrorExcel("El archivo Excel está vacío");

  /**
   * `defval: null` mantiene las celdas vacías en el objeto. Sin él, las filas con
   * huecos pierden esas claves y la tabla de resultados se descuadra: no todas las
   * filas tendrían las mismas columnas.
   */
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: null });
  if (!filas.length) throw new ErrorExcel("El Excel no tiene ninguna fila de datos");

  const columnas = Object.keys(filas[0]);
  const colMunicipio = localizaColumna(columnas, COLUMNA_MUNICIPIO);
  if (!colMunicipio) {
    throw new ErrorExcel("El Excel debe tener una columna 'MUNICIPIO'");
  }
  const colProvincia = localizaColumna(columnas, COLUMNA_PROVINCIA);

  return {
    columnas,
    filas: filas.map((datos) => ({
      datos,
      municipio: String(datos[colMunicipio] ?? "").trim(),
      provincia: colProvincia ? String(datos[colProvincia] ?? "").trim() : "",
    })),
  };
}
