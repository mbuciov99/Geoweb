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
            conexionBD = psycopg2.connect(host='localhost', dbname='cdmx', user='postgres', password='ubuntu', port=5432)
            cursor = conexionBD.cursor()

            for geometria in geometrias:
                strSQL = "SELECT gid, nomgeo, cve_mun, municipio, pob_2015, vul_social, sup_km2, densidad_hab_km2, ST_AsBinary(geom) "
                strSQL += "FROM alcaldias "
                strSQL += f"WHERE (ST_Intersects(alcaldias.geom,ST_GeomFromText('{geometria.ExportToWkt()}',4326)))"
                cursor.execute(strSQL)
                registros = cursor.fetchall()

                for registro in registros:
                    cve_gid, cve_nomgeo, cve_cve_mun, cve_municipio, cve_pob_2015, cve_vul_social, cve_sup_km2, cve_densidad_hab_km2, geom_bytes = registro
                    res_geometria = ogr.CreateGeometryFromWkb(geom_bytes)
                    geometria_json = json.loads(res_geometria.ExportToJson())
                    propiedades = {
                        'cve_gid': cve_gid,
                        'cve_nomgeo': cve_nomgeo,
                        'cve_cve_mun': cve_cve_mun,
                        'cve_municipio': cve_municipio,
                        'cve_pob_2015': cve_pob_2015,
                        'cve_vul_social': cve_vul_social,
                        'cve_sup_km2': str(cve_sup_km2),
                        'cve_densidad_hab_km2': str(cve_densidad_hab_km2)
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