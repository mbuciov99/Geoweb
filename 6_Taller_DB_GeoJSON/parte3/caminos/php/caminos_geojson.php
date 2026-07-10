<?php 
// Abre una conexion al servidor de pgsql
$connection=pg_connect ("host=localhost dbname=caminos port=5432 user=postgres password=ubuntu");
if (!$connection) {
  die("No se ha podido establecer conexion con la bd.  ");
  exit;
}
$tipo = $_GET['tipo'];
// Genera la consulta a la base de datos => $query
$query = "SELECT gid, id_red, tipo_vial, nombre, recubri, carriles, velocidad, longitud, ancho, ST_AsGeoJSON(geom) as coords
FROM public.red_vial_2024_test
where tipo_vial = '" . $tipo . "'
order by id_red";


//echo $query;
$result = pg_query($query);
if (!$result) {
  die("Invalid query: " . pg_error());
}

$resultados = [];
while($row = @pg_fetch_assoc($result)) {
  $geometry = $row['coords'] = json_decode($row['coords']);
  unset($row['coords']);
  $feature = ["type"=>"Feature","geometry"=>$geometry,"properties" => $row];
  array_push($resultados,$feature);
}
$featureCollection = ["type"=>"FeatureCollection","features"=>$resultados];
echo json_encode($featureCollection);
?>
