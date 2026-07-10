<?php 

// Abre una conexion al servidor de pgsql
$connection=pg_connect ("host=localhost dbname=cdmx port=5432 user=postgres password=ubuntu");
if (!$connection) {
  die("No se ha podido establecer conexion con la bd.  ");
  exit;
}

// Genera la consulta a la base de datos
$query = "SELECT nomgeo, pob_2015,sup_km2, vul_social ";
if($_POST['alcaldia'] == 'true') {
  $query = $query.", cve_mun ";
} else if($_POST['densidad'] == 'true') {
  $query = $query.", densidad_hab_km2 ";
}
$query = $query.", ST_AsGeoJson(geom,5) as coords ";
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
