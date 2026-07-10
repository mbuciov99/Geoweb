<?php 

// Abre una conexion al servidor de pgsql
$connection=pg_connect ("host=localhost dbname=cdmx port=5432 user=postgres password=ubuntu");
if (!$connection) {
  die("No se ha podido establecer conexion con la bd.  ");
  exit;
}

// Genera la consulta a la base de datos
$query = "SELECT * ";
$query = $query."FROM alcaldias ORDER BY cve_mun";
//echo $query;

$result = pg_query($query);
if (!$result) {
  die("Invalid query: " . pg_error());
}

$features = [];
while($row = @pg_fetch_assoc($result)) {
  $geometry = $row['coords'] = json_decode($row['coords']);
  unset($row['coords']);
  $feature = ["type"=>"Feature","geometry"=>$geometry,"properties" => $row];
  array_push($features,$feature);
}
$featureCollection = ["type"=>"FeatureCollection","features"=>$features];
echo json_encode($featureCollection); 

?>
