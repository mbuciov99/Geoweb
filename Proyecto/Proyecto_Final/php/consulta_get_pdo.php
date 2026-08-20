<?php
try {
    $dsn = "pgsql:host=localhost;port=5432;dbname=siicyt;";
    $user = "postgres";
    $password = "ubuntu";

    $pdo = new PDO("$dsn", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Recibimos tus nuevas variables
    $palabra = $_GET['palabra'] ?? '';
    $entidad = $_GET['entidad'] ?? '';

    // Nueva consulta combinada (Inciso F)
    $query = "SELECT nombre, tipo, delmun, entidad, sector, rama, clase FROM reniecyt2013a 
              WHERE CONCAT(nombre, tipo, delmun, entidad, sector, rama, clase, tipo, delmun, entidad, sector, rama, clase) ILIKE :palabra AND entidad = :entidad 
              ORDER BY nombre LIMIT 50";
 
    $stmt = $pdo->prepare($query);
    // Ejecutamos inyectando los comodines para la búsqueda de palabra
    $stmt->execute([
        ':palabra' => '%' . $palabra . '%',
        ':entidad' => $entidad
    ]);

    $data = $stmt->fetchAll();
    echo json_encode($data);
} catch (PDOException $e) {
    die ("Error de conexión: " . $e->getMessage());
}
?>