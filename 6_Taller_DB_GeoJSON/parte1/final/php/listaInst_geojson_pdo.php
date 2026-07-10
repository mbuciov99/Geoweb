<?php
// Configuración de la conexión utilizando PDO
$dsn = 'pgsql:host=localhost;dbname=siicyt;port=5432';
$user = 'postgres';
$password = 'ubuntu';

try {
    // Crear una nueva conexión PDO
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Manejo de errores
} catch (PDOException $e) {
    // Si no se puede conectar, mostrar el error
    die("No se ha podido establecer conexión con la base de datos: " . $e->getMessage());
}

$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;

// Generar la consulta a la base de datos con parámetros
$query = "SELECT nombre, tipo, delmun, entidad, sector, rama, clase, tamanio, ST_AsGeoJson(geom, 5) as coords FROM reniecyt2013a ";
if ($tipo) {
    $query .= "WHERE tipo = :tipo ";
}
$query .= "ORDER BY nombre LIMIT 50";

// Preparar y ejecutar la consulta
$stmt = $pdo->prepare($query);
if ($tipo) {
    $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);
}
$stmt->execute();

// Obtener los resultados
$resultados = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $geometry = json_decode($row['coords']);
    unset($row['coords']);
    $feature = [
        "type" => "Feature",
        "geometry" => $geometry,
        "properties" => $row
    ];
    $resultados[] = $feature;
}

// Crear la colección de características y devolverla como JSON
$featureCollection = [
    "type" => "FeatureCollection",
    "features" => $resultados
];
echo json_encode($featureCollection);
?>