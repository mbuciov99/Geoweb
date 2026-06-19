<?php
try {
    // 1. Establece una conexión a PostgreSQL usando PDO
    $dsn = "pgsql:host=localhost;port=5432;dbname=siicyt;";
    $user = "postgres";
    $password = "ubuntu";

    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Manejo de errores con excepciones
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // Devuelve resultados como array asociativo
    ]);

    // Variable para recibir valor desde el html metodo GET
    $tipo= $_POST['tipo']?? null;

    // 2. Generar una consulta a la base de datos con posible filtro
    $query = "SELECT nombre, tipo, delmun, entidad, sector, rama, clase FROM reniecyt2013a ";
    if ($tipo) {
        $query .= "WHERE TRIM(tipo) = TRIM(:tipo) ";
    }
    $query .= "ORDER BY nombre";

    // 3. Preparar y ejecutar la consulta
    //$stmt = $pdo->query($query);
    $stmt = $pdo->prepare($query);
    if ($tipo) {
        $stmt -> bindParam(':tipo', $tipo, PDO::PARAM_STR);
    }
    $stmt->execute();

    // 4. Obtener resultados en un array asociativo
    $data = $stmt->fetchAll();

    // 5. Retornar datos en formato JSON
    echo json_encode($data);

} catch (PDOException $e) {
    // Manejo de errores de conexión o consulta
    die("Error en la conexión o consulta: " . $e->getMessage());
}
?>
