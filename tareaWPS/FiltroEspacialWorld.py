import json
import psycopg2
from pywps import Process, LiteralInput, LiteralOutput, Format
from osgeo import ogr
import logging
import time

class FiltroEspacialWorld(Process):
    def __init__(self):
        inputs = [
            LiteralInput('geo', 'Geometria', abstract="Geometría wkt, json, o gml", data_type='string', min_occurs=0),
        ]
        outputs = [
            LiteralOutput('output', 'FiltroEspacialWorld(Geometría)', abstract="Resultado como cadena", data_type="string"),
        ]

        super(FiltroEspacialWorld, self).__init__(
            self._handler,
            identifier='FiltroEspacialWorld',
            version='1.0',
            title='Consulta espacial sobre la bd world',
            abstract='Se realizan consultas a una capa de info vectorial en BD a partir de una geometría de entrada',
            profile='',
            inputs=inputs,
            outputs=outputs,
            store_supported=True,
            status_supported=True
        )

    def _handler(self, request, response):
        #self.status.set("Iniciando proceso...", 0)

        geometrias = []
        geo_value = request.inputs['geo'][0].data
        if geo_value:
            try:
                from osgeo import ogr
                geometria = ogr.CreateGeometryFromWkt(geo_value)
            except Exception as e:
                self.status.set("Error al procesar la geometría de entrada.", 100)
                response.outputs['output'].data = f"Error: {str(e)}"
                return response

            if geometria:
                geometrias.append(geometria)
            else:
                self.status.set("Geometría de entrada no válida.", 100)
                response.outputs['output'].data = "Geometría de entrada no válida."
                return response
        else:
            self.status.set("No hay datos para realizar la operación.", 100)
            response.outputs['output'].data = "No hay datos para realizar la operación."
            return response

        dic_geojson = {'type': 'FeatureCollection', 'features': []}
        try:
            conexionBD = psycopg2.connect(host='localhost', dbname='world', user='postgres', password='ubuntu', port=5432)
            cursor = conexionBD.cursor()

            for geometria in geometrias:
                strSQL = "SELECT id, fips, iso3, un, name, area, pop2005, region, ST_AsBinary(geom) "
                strSQL += "FROM world_borders "
                strSQL += f"WHERE (ST_Intersects(world_borders.geom, ST_GeomFromText('{geometria.ExportToWkt()}',4326)))"
                cursor.execute(strSQL)
                registros = cursor.fetchall()

                for registro in registros:
                    id, fips, iso3, un, name, area, pop2005, region, geom = registro
                    res_geometria = ogr.CreateGeometryFromWkb(geom)
                    geometria_json = json.loads(res_geometria.ExportToJson())
                    propiedades = {
                        'id': id,
                        'fips': fips,
                        'iso3': iso3,
                        'un': un,
                        'nombre': name,
                        'area': area,
                        'pop2005': pop2005,
                        'region': region
                    }
                    feature = {'type': 'Feature', 'properties': propiedades, 'geometry': geometria_json}
                    dic_geojson['features'].append(feature)

            response.outputs['output'].data = json.dumps(dic_geojson)
            cursor.close()
            conexionBD.close()
        except Exception as e:
            #self.status.set("Error en la consulta a la base de datos.", 100)
            response.outputs['output'].data = f"Error: {str(e)}"

        return response