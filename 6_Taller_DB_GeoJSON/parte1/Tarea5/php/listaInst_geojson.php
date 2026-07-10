<?php
// Mostrar errores para saber què falla exactamente
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Abre una conexion al servidor de pgsql
$connection=pg_connect ("host=localhost dbname=siicyt port=5432 user=postgres password=ubuntu");
if (!$connection) {
  die("No se ha podido establecer conexion con la bd.  ");
  exit;
}

// recibir las dos variables que manda el JS
$palabra = $_GET['palabra'];
$tamanio= $_GET['tamanio'];

// Genera la consulta a la base de datos
$query = "SELECT nombre,tipo,delmun,entidad,sector,rama,clase,tamanio, ST_AsGeoJson(geom,5) as coords
          FROM reniecyt2013a 
          WHERE 1=1 ";
        
// Filtro para la caja de texto: buscar la palabra en el Nombre o en el Municipio (delmun)
if (isset($palabra) && $palabra != '') {
  // '%' busca la palabra en cualquier parte del texto
    $query .= "AND (nombre ILIKE '%".$palabra."%' OR delmun ILIKE '%".$palabra."%' OR tipo ILIKE '%".$palabra."%') ";
}

// Filtro para el select: buscando el tamaño exacto
if(isset($tamanio) && $tamanio != ''){
  $query .= " AND tamanio = '".$tamanio."' ";
}
$query .= " ORDER BY nombre";

//echo $query; (Ejecucion)
$result = pg_query($connection, $query);
if (!$result) {
  die("Invalid query: " . pg_last_error($connection));
}

// Armar el GeoJSON
$resultados = [];
while($row = @pg_fetch_assoc($result)) {
  $row['coords']= json_decode($row['coords']);
  $geometry = $row['coords'];
  unset($row['coords']);

  $feature = ["type"=>"Feature","geometry"=>$geometry,"properties" => $row];
  array_push($resultados, $feature);
}
$featureCollection = ["type"=>"FeatureCollection", "features"=>$resultados];
echo json_encode($featureCollection);

?>
