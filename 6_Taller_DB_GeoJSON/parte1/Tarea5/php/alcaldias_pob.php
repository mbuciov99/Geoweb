<<?php
// Mostrar errores para saber què falla exactamente
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$connection = pg_connect("host=localhost dbname=cdmx port=5432 user=postgres password=ubuntu");
if (!$connection) {
  echo json_encode(["error" => "No conexión"]); exit;
}

$filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';
$query = "SELECT nomgeo, pob_2015, ST_AsGeoJson(geom,5) as coords FROM alcaldias WHERE 1=1 ";

// Cambiamos el SQL según la letra que mandó el botón
switch ($filtro) {
    case 'a': $query .= " AND pob_2015 > 1000000"; break;
    case 'b': $query .= " AND pob_2015 > 500000 AND pob_2015 <= 1000000"; break;
    case 'c': $query .= " AND pob_2015 > 200000 AND pob_2015 <= 500000"; break;
    case 'd': $query .= " AND pob_2015 <= 200000"; break;
    case 'e': $query .= " AND nomgeo LIKE 'C%'"; break;
    case 'f': $query .= " AND nomgeo LIKE 'T%'"; break;
}

$result = pg_query($connection, $query);
$resultados = [];

while($row = pg_fetch_assoc($result)) {
  $row['coords'] = json_decode($row['coords']);
  $geometry = $row['coords'];
  unset($row['coords']);
  array_push($resultados, ["type"=>"Feature", "geometry"=>$geometry, "properties" => $row]);
}

echo json_encode(["type"=>"FeatureCollection", "features"=>$resultados]);
?>