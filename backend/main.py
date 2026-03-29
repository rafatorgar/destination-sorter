import os
import json
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import googlemaps
import io

app = FastAPI(title="Destinos Oposiciones API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "")


def get_gmaps_client() -> googlemaps.Client:
    if not GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=500, detail="API Key de Google Maps no configurada en el servidor")
    try:
        return googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
    except Exception:
        raise HTTPException(status_code=500, detail="API Key de Google Maps no válida")


def geocode_municipio(gmaps: googlemaps.Client, municipio: str, provincia: str = ""):
    """Return {lat, lng} for a municipio, or None if not found."""
    try:
        query = f"{municipio}, {provincia}, España" if provincia else f"{municipio}, España"
        results = gmaps.geocode(query)
        if results:
            loc = results[0]["geometry"]["location"]
            return {"lat": loc["lat"], "lng": loc["lng"]}
    except Exception:
        pass
    return None


def calcular_distancia(gmaps: googlemaps.Client, origen: str, destino: str, provincia: str) -> float:
    try:
        result = gmaps.distance_matrix(origins=origen, destinations=destino, mode="driving")
        distancia = result["rows"][0]["elements"][0]["distance"]["value"]
        return distancia / 1000
    except Exception:
        try:
            destino_completo = f"{destino}, {provincia}"
            result = gmaps.distance_matrix(origins=origen, destinations=destino_completo, mode="driving")
            distancia = result["rows"][0]["elements"][0]["distance"]["value"]
            return distancia / 1000
        except Exception:
            return float("inf")


@app.post("/api/procesar")
async def procesar(
    archivo: UploadFile = File(...),
    municipio_referencia: str = Form(...),
):
    if not archivo.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel (.xlsx o .xls)")

    gmaps = get_gmaps_client()

    contenido = await archivo.read()
    try:
        df = pd.read_excel(io.BytesIO(contenido))
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo leer el archivo Excel")

    if "MUNICIPIO" not in df.columns:
        raise HTTPException(status_code=400, detail="El Excel debe tener una columna 'MUNICIPIO'")

    total = len(df)

    columns = [col for col in df.columns]

    def generate():
        # Geocode origin
        origen_coords = geocode_municipio(gmaps, municipio_referencia)

        # Send start event with column names and origin coordinates
        yield json.dumps({
            "type": "start",
            "origen": municipio_referencia,
            "total": total,
            "columnas": columns,
            "origen_coords": origen_coords,
        }) + "\n"

        for _, fila in df.iterrows():
            municipio = str(fila.get("MUNICIPIO", ""))
            provincia = str(fila.get("PROVINCIA", ""))
            distancia = calcular_distancia(gmaps, municipio_referencia, municipio, provincia)
            dist_value = round(distancia, 1) if distancia != float("inf") else None

            # Geocode destination
            coords = geocode_municipio(gmaps, municipio, provincia)

            # Send all original columns + distance
            row_data = {}
            for col in columns:
                val = fila[col]
                # Convert to JSON-safe value
                if pd.isna(val):
                    row_data[col] = None
                elif isinstance(val, float) and (val == float("inf") or val == float("-inf")):
                    row_data[col] = None
                else:
                    row_data[col] = val if isinstance(val, (str, int, float, bool)) else str(val)

            row_data["Distancia (km)"] = dist_value

            yield json.dumps({
                "type": "destino",
                "data": row_data,
                "municipio": municipio,
                "provincia": provincia,
                "distancia": dist_value,
                "coords": coords,
            }) + "\n"

        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@app.post("/api/descargar")
async def descargar(
    archivo: UploadFile = File(...),
    municipio_referencia: str = Form(...),
):
    if not archivo.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel (.xlsx o .xls)")

    gmaps = get_gmaps_client()

    contenido = await archivo.read()
    try:
        df = pd.read_excel(io.BytesIO(contenido))
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo leer el archivo Excel")

    if "MUNICIPIO" not in df.columns:
        raise HTTPException(status_code=400, detail="El Excel debe tener una columna 'MUNICIPIO'")

    distancias = []
    for _, fila in df.iterrows():
        municipio = str(fila.get("MUNICIPIO", ""))
        provincia = str(fila.get("PROVINCIA", ""))
        distancia = calcular_distancia(gmaps, municipio_referencia, municipio, provincia)
        distancias.append(distancia)

    df["Distancia (km)"] = distancias
    df = df.sort_values("Distancia (km)").reset_index(drop=True)

    output = io.BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=destinos_ordenados.xlsx"},
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}
