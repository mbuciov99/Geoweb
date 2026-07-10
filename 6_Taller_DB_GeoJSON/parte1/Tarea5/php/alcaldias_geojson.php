<?php
header('Content-Type: application/json; charset=utf-8');
// Mostrar errores para saber què falla exactamente
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Abre una conexion al servidor de pgsql
$connection=pg_connect ("host=localhost dbname=cdmx port=5432 user=postgres password=ubuntu");
if (!$connection) {
  die("No se ha podido establecer conexion con la bd.  ");
  exit;
}

// Consultamos la tabla alcaldias 
$query = "SELECT nomgeo, vul_social, ST_AsGeoJson(geom,5) as coords FROM alcaldias";
$result = pg_query($connection, $query);

if (!$result) {
  echo json_encode(["error" => "Error en la consulta: " . pg_last_error($connection)]);
  exit;
}

// Armar el GeoJSON
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
