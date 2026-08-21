<?php
try {
    $dsn = "pgsql:host=localhost;port=5432;dbname=;rama";
    $user = "postgres";
    $password = "ubuntu";

    $pdo = new PDO("$dsn", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $estacion = $_GET['estacion'] ?? '';
    $latitud = $_GET['latitud'] ?? '';
    $longitud = $_GET['longitud'] ?? '';
    $gas = $_GET['gas'] ?? '';
   

    $gases_permitidos = ['co', 'no', 'no2', 'nox', 'o3', 'pm10', 'pm25', 'pmco', 'so2'];

    if (!in_array($gas, $gases_permitidos)) {
        die(json_encode(['error' => 'El gas seleccionado no es válido.']));
    }

    // Usamos comillas dobles para respetar las mayúsculas con las que se importó la tabla
    $query = "SELECT
                m.fecha,
                m.hora,
                m.clave_estacion,
                rs.\"Nombre\",
                m.{$gas},
                ST_X(ST_Transform(rs.geom, 4326)) AS longitud,
                ST_Y(ST_Transform(rs.geom, 4326)) AS latitud
              FROM mediciones_rama m
              JOIN rama_stations rs ON m.clave_estacion = rs.\"Clave\"
              WHERE 1=1";

    $params = [];

    if (!empty($estacion)) {
        $query .= " AND (rs.\"Nombre\" ILIKE :estacion OR m.clave_estacion ILIKE :estacion)";
        $params['estacion'] = '%' . $estacion . '%';
    }

    if (!empty($latitud) && !empty($longitud)) {
        $query .= " AND ST_DWithin(
                        rs.geom::geography, 
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 
                        5000
                    )";
        $params['lat'] = $latitud;
        $params['lon'] = $longitud;
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
    
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'total' => count($data),
        'datos' => $data
    ]);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
?>