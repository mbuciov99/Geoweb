import pandas as pd
import numpy as np
import os

ruta_carpeta= r"C:\\Geoweb\\Proyecto\\25RAMA"

# Definir los gases a proecesar
gases= ['CO', 'NO', 'NO2', 'NOX', 'O3', 'PM10', 'PM25', 'PMCO', 'SO2']

# DataFrame maestro donde se une toda la informacion
df_maestro= None

print("===================================================================================================")
print("Iniciando procesamiento de la RAMA...")
print("===================================================================================================")

for gas in gases:
    nombre_archivo= f"2025{gas}.xls"
    ruta_completa= os.path.join(ruta_carpeta, nombre_archivo)
    
    try:
        # Leer archivo
        df_gas= pd.read_excel(ruta_completa)
        print(f"Procesando {gas}...")
        
        # Limpieza de valores atípicos: remplazar -99 por nulos (NaN)
        df_gas= df_gas.replace(-99, np.nan)
        
        # Transformar el formato ancho al formato largo
        df_melted= df_gas.melt(
            id_vars= ['FECHA', 'HORA'], # Columnas que no se van a deretir
            var_name= 'clave_estacion', # Nuevo nombre para la columna de estaciones
            value_name= gas.lower() # Nombre de la columna para los valores 
        )
        
        # Unir el DataFrame maestro
        if df_maestro is None:
            df_maestro= df_melted
        else:
            # Unir las tres columnas clave usando 'outer join' para no perder ninguna estación ni hora, aunque falten datos
            df_maestro= pd.merge(df_maestro, df_melted,
                                 on= ['FECHA', 'HORA', 'clave_estacion'],
                                 how= 'outer')
            
    except FileNotFoundError:
        print(f"Advertencia: no se encontró el archivo {nombre_archivo}")
        
# Limpieza de espacios en blanco accidentales en las claves de las estaciones
df_maestro['clave_estacion']= df_maestro['clave_estacion'].str.strip()

# Ordenar un poco para que se ve estético (Fecha, Hora, Estacion)
df_maestro= df_maestro.sort_values(by=['FECHA', 'HORA', 'clave_estacion'])

# Exportar el resultado limpio y listo para DBeaver
ruta_salida= os.path.join(ruta_carpeta, "Mediciones_RAMA_2025_limpio.csv")
df_maestro.to_csv(ruta_salida, index= False)

print("===================================================================================================")
print("\nProceso terminado")
print("===================================================================================================")
print("Muestra de la tabla final:")
print(df_maestro.head())
