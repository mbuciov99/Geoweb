<?php

header('Content-Type: application/json; charset=utf-8');

try {
    $dsn = "pgsql:host=localhost;port=5432;dbname=RAMA";
    // $dsn = "pgsql:host=localhost;port=5432;dbname=rama"; // para Coraima
    $user = "postgres";
    $password = "ubuntu";

    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Datos recibidos desde el formulario
    $estacion = trim($_GET['estacion'] ?? '');
    $gas = $_GET['gas'] ?? '';
    $fecha = $_GET['fecha'] ?? '';
    $hora = $_GET['hora'] ?? '';
    $formato = $_GET['formato'] ?? 'json';

    // Evita que se introduzca directamente cualquier columna en el SQL
    $gases_permitidos = [
        'co', 'no', 'no2', 'nox', 'o3',
        'pm10', 'pm25', 'pmco', 'so2'
    ];

    if (!in_array($gas, $gases_permitidos, true)) {
        throw new Exception('El gas seleccionado no es válido.');
    }

    /*
     * Las coordenadas no se solicitan en el formulario.
     * Se calculan internamente a partir de la geometría de cada estación
     * para mostrar los resultados en Leaflet y generar el KML.
     */
    $query = "
        SELECT
            m.fecha,
            m.hora,
            m.clave_estacion,
            rs.\"Nombre\",
            m.{$gas},
            ST_X(ST_Transform(rs.geom, 4326)) AS longitud,
            ST_Y(ST_Transform(rs.geom, 4326)) AS latitud
        FROM mediciones_rama AS m
        JOIN rama_stations AS rs
            ON m.clave_estacion = rs.\"Clave\"
        WHERE 1 = 1
    ";

    $params = [];

    if ($estacion !== '') {
        $query .= "
            AND (
                rs.\"Nombre\" ILIKE :estacion
                OR m.clave_estacion ILIKE :estacion
            )
        ";
        $params['estacion'] = '%' . $estacion . '%';
    }

    if ($fecha !== '') {
        $query .= " AND m.fecha = :fecha";
        $params['fecha'] = $fecha;
    }

    if ($hora !== '') {
        $query .= " AND m.hora = :hora";
        $params['hora'] = $hora;
    }

    $query .= " ORDER BY m.fecha, m.hora";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    // Descarga en formato KML
    if ($formato === 'kml') {
        header_remove('Content-Type');
        header('Content-Type: application/vnd.google-earth.kml+xml; charset=utf-8');
        header('Content-Disposition: attachment; filename="reporte_estaciones.kml"');

        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<kml xmlns="http://www.opengis.net/kml/2.2">';
        echo '<Document>';
        echo '<name>Resultados RAMA</name>';

        foreach ($data as $row) {
            $nombre = htmlspecialchars(
                $row['Nombre'] ?? 'Estación',
                ENT_XML1,
                'UTF-8'
            );

            $clave = htmlspecialchars(
                $row['clave_estacion'] ?? '',
                ENT_XML1,
                'UTF-8'
            );

            $valor = htmlspecialchars(
                (string) ($row[$gas] ?? ''),
                ENT_XML1,
                'UTF-8'
            );

            $longitud = $row['longitud'] ?? '';
            $latitud = $row['latitud'] ?? '';

            if ($longitud === '' || $latitud === '') {
                continue;
            }

            echo '<Placemark>';
            echo '<name>' . $nombre . '</name>';
            echo '<description><![CDATA[';
            echo 'Clave: ' . $clave . '<br>';
            echo 'Fecha: ' . ($row['fecha'] ?? '') . '<br>';
            echo 'Hora: ' . ($row['hora'] ?? '') . '<br>';
            echo strtoupper($gas) . ': ' . $valor;
            echo ']]></description>';
            echo '<Point>';
            echo '<coordinates>' . $longitud . ',' . $latitud . ',0</coordinates>';
            echo '</Point>';
            echo '</Placemark>';
        }

        echo '</Document>';
        echo '</kml>';
        exit;
    }

    // Respuesta para JavaScript, tabla, gráfica y mapa
    echo json_encode([
        'total' => count($data),
        'datos' => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}