<?php

try {

    // 1️⃣ Conexión con PDO
    $dsn = "pgsql:host=localhost;port=5432;dbname=cdmx;";
    $usuario = "postgres";
    $password = "ubuntu";

    $pdo = new PDO($dsn, $usuario, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 2️⃣ Construcción dinámica del SELECT
    $query = "SELECT nomgeo, pob_2015, sup_km2, vul_social ";

    if (isset($_POST['alcaldia']) && $_POST['alcaldia'] === 'true') {
        $query .= ", cve_mun ";
    } elseif (isset($_POST['densidad']) && $_POST['densidad'] === 'true') {
        $query .= ", densidad_hab_km2 ";
    }

    $query .= ", ST_AsGeoJson(geom,5) as coords ";
    $query .= "FROM alcaldias ORDER BY cve_mun";

    // 3️⃣ Preparar y ejecutar
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    // 4️⃣ Construcción del GeoJSON
    $features = [];

    while ($row = $stmt->fetch()) {

        $geometry = json_decode($row['coords']);
        unset($row['coords']);

        $feature = [
            "type" => "Feature",
            "geometry" => $geometry,
            "properties" => $row
        ];

        $features[] = $feature;
    }

    $featureCollection = [
        "type" => "FeatureCollection",
        "features" => $features
    ];

    header('Content-Type: application/json');
    echo json_encode($featureCollection);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "error" => "Error de conexión o consulta",
        "detalle" => $e->getMessage()
    ]);

}