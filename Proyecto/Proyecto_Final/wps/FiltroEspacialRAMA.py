
import json
import psycopg2

from pywps import Process, LiteralInput, LiteralOutput


class FiltroEspacialRAMA(Process):

    def __init__(self):

        inputs = [
            LiteralInput(
                "geo",
                "Polígono de consulta",
                abstract="Geometría poligonal en formato WKT y EPSG:4326",
                data_type="string"
            )
        ]

        outputs = [
            LiteralOutput(
                "resultado",
                "Estaciones RAMA seleccionadas",
                abstract="FeatureCollection GeoJSON",
                data_type="string"
            )
        ]

        super(FiltroEspacialRAMA, self).__init__(
            self._handler,
            identifier="FiltroEspacialRAMA",
            version="1.0",
            title="Filtro espacial de estaciones RAMA",
            abstract=(
                "Selecciona mediante PostGIS las estaciones RAMA "
                "que intersectan un polígono dibujado por el usuario."
            ),
            inputs=inputs,
            outputs=outputs,
            store_supported=True,
            status_supported=True
        )

    def _handler(self, request, response):

        conexion = None
        cursor = None

        try:
            geometria_wkt = request.inputs["geo"][0].data

            if not geometria_wkt:
                raise ValueError(
                    "No se recibió una geometría para la consulta."
                )

            conexion = psycopg2.connect(
                host="localhost",
                dbname="rama",
                user="postgres",
                password="ubuntu",
                port=5432
            )

            cursor = conexion.cursor()

            consulta = """
                SELECT
                    "Clave",
                    "Nombre",
                    "Alcaldía/Municipio",
                    "Estado",
                    ST_AsGeoJSON(geom)
                FROM public.rama_stations
                WHERE geom IS NOT NULL
                  AND ST_Intersects(
                      geom,
                      ST_SetSRID(
                          ST_GeomFromText(%s),
                          4326
                      )
                  )
                ORDER BY "Nombre";
            """

            cursor.execute(
                consulta,
                (geometria_wkt,)
            )

            registros = cursor.fetchall()
            features = []

            for registro in registros:

                clave = registro[0]
                nombre = registro[1]
                municipio = registro[2]
                estado = registro[3]
                geometria = json.loads(registro[4])

                features.append({
                    "type": "Feature",
                    "properties": {
                        "clave": clave,
                        "nombre": nombre,
                        "municipio": municipio,
                        "estado": estado
                    },
                    "geometry": geometria
                })

            resultado = {
                "type": "FeatureCollection",
                "total": len(features),
                "features": features
            }

            response.outputs["resultado"].data = json.dumps(
                resultado,
                ensure_ascii=False
            )

        except Exception as error:

            response.outputs["resultado"].data = json.dumps(
                {
                    "error": str(error)
                },
                ensure_ascii=False
            )

        finally:

            if cursor is not None:
                cursor.close()

            if conexion is not None:
                conexion.close()

        return response
