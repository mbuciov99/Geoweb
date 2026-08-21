<?php
try {
    $dsn = "pgsql:host=localhost;port=5432;dbname=RAMA;";
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
    $formato = $_GET['formato'] ?? 'json';

    $gases_permitidos = ['co', 'no', 'no2', 'nox', 'o3', 'pm10', 'pm25', 'pmco', 'so2'];

    if (!in_array($gas, $gases_permitidos)) {
        die(json_encode(['error' => 'El gas seleccionado no es válido.']));
    }

    $query = "SELECT m.fecha, m.hora, m.clave_estacion, rs.\"Nombre\", m.{$gas} 
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
                        rs.\"geom\"::geography, 
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 
                        5000
                    )";
        $params['lat'] = $latitud;
        $params['lon'] = $longitud;
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
    
    // Si piden KML desde el servidor
    if ($formato === 'kml') {
        header('Content-Type: application/vnd.google-earth.kml+xml; charset=utf-8');
        header('Content-Disposition: attachment; filename=reporte_estaciones.kml');
        
        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<kml xmlns="http://www.opengis.net/kml/2.2">';
        echo '<Document>';
        echo '<name>Resultados RAMA</name>';
        
        foreach ($data as $row) {
            echo '<Placemark>';
            echo '<name>' . htmlspecialchars($row['Nombre'] ?? 'Estación') . '</name>';
            echo '<description><![CDATA[Fecha: ' . ($row['fecha'] ?? '') . ' - Gas: ' . $row[$gas] . ']]></description>';
            echo '<Point><coordinates>-99.13,19.43,0</coordinates></Point>';
            echo '</Placemark>';
        }
        
        echo '</Document>';
        echo '</kml>';
        exit;
    }

    // Por defecto devolvemos JSON para la interfaz web
    header('Content-Type: application/json');
    echo json_encode($data);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
?>