<?php
try {
    // Configuración de la conexión a la base de datos
    $dsn = "pgsql:host=localhost;port=5432;dbname=siicyt;";
    $user = "postgres";
    $password = "ubuntu";

    // Crear una nueva conexión PDO
    $pdo = new PDO("$dsn", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
   $tipo = $_POST['tipo'] ?? '';

    // Generar una consulta a la base de datos
    $query = "SELECT nombre, tipo, delmun, entidad, sector, rama, clase FROM reniecyt2013a ";
   if ($tipo) {
        $query .= " WHERE tipo = :tipo";
    }
    $query .= " Order by nombre";
 
    // Preparar y ejecutar la consulta
    $stmt = $pdo->prepare($query);
    if ($tipo) {
        $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);
    }
    $stmt->execute();

    // Obtener los resultados
    $data = $stmt->fetchAll();
    // Devolver los resultados como JSON
    echo json_encode($data);
} catch (PDOException $e) {
    die ("Error de conexión: " . $e->getMessage());
}
?>