<?php 
// Abre una conexion al servidor de pgsql
$connection=pg_connect ("host=localhost dbname=siicyt port=5432 user=postgres password=ubuntu");
if (!$connection) {
  die("No se ha podido establecer conexion con la bd.  ");
  exit;
}
$tipo = $_GET['tipo'];
// Genera la consulta a la base de datos
$query = "SELECT nombre,tipo,delmun,entidad,sector,rama,clase,tamanio, ST_AsGeoJson(geom,5) as coords FROM reniecyt2013a ";
if (isset($tipo)) {
    $query = $query."WHERE tipo ='".$tipo."' ";
}
    $query = $query."ORDER BY nombre LIMIT 50";

//echo $query;
$result = pg_query($query);
if (!$result) {
  die("Invalid query: " . pg_error());
}


?>
