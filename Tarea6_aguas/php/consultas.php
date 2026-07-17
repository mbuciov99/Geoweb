<?php
try {
    $connection = pg_connect("host=localhost port=5432 dbname=siicyt user=postgres password=ubuntu");

    if (!$connection) {
        die(json_encode(["error" => "Error de conexión."]));
    }

    $inciso = isset($_GET['inciso']) ? $_GET['inciso'] : 'A';
    $parametro = isset($_GET['parametro']) ? (float)$_GET['parametro'] : 5; 
    $sede = isset($_GET['sede']) ? $_GET['sede'] : 'CDMX';


    $coordenadas = [
        'CDMX' => '-99.221416, 19.291666', 
        'Merida' => '-89.7807, 21.1309',
        'Aguascalientes' => '-102.3458, 21.9288' 
    ];

    $punto_origen = $coordenadas[$sede] ?? $coordenadas['CDMX'];

    if($inciso == "A") {
        $query = "SELECT nombre,
                ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography)/1000 AS distancia_km, 
                ST_AsGeoJSON(geom) AS coords
              FROM reniecyt2013a
              ORDER BY distancia_km LIMIT {$parametro};";
    } 
    elseif($inciso == "B") {
        $query = "SELECT nombre,
                ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography)/1000 AS distancia_km, 
                ST_AsGeoJSON(geom) AS coords
              FROM reniecyt2013a
              WHERE tipo LIKE '%CENTRO PUBLICO%' OR tipo LIKE '%INVESTIGACION%' 
              ORDER BY distancia_km LIMIT {$parametro};";
    }
    // c: Mi domicilio 
    elseif($inciso == "C") {
        // Asignacion de coordenadas por cada sede de Centro Geo
        if($sede == 'Aguascalientes'){
            $mi_lon = -102.2960; 
            $mi_lat = 21.8823;
            $domicilio = 'Casa de Brenda';
            $etiqueta= 'Distancia de la sede a casa de Brenda'; 
        } elseif ($sede == 'CDMX') {
            $mi_lon= -98.99947484959046;
            $mi_lat= 19.378648413678867;
            $domicilio = 'Casa de Marichuy';
            $etiqueta= 'Distancia de la sede a casa de Marichuy'; 
        } elseif ($sede == 'Merida'){
            $mi_lon= -89.57913448136577;
            $mi_lat= 20.974512342502887;
            $domicilio = 'Casa de Coraima';
            $etiqueta= 'Distancia de la sede a casa de Coraima'; 
        }
        // Coordenadas aproximadas de las tres cedes de Centro Geo (Aguascalientes, CDMX y Merida)
        $query = "SELECT '{$etiqueta}' AS nombre,
                ST_Distance(
                    ST_SetSRID(ST_MakePoint({$mi_lon}, {$mi_lat}), 4326)::geography,
                    ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography
                )/1000 AS distancia_km,
                ST_AsGeoJSON(
                    ST_MakeLine(
                        ST_SetSRID(ST_MakePoint({$mi_lon}, {$mi_lat}), 4326),
                        ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)
                    )
                ) AS coords
                UNION ALL
                SELECT 
                    '{$domicilio}' AS nombre,
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint({$mi_lon}, {$mi_lat}),4326):: geography,
                        ST_SetSRID(ST_MakePoint({$punto_origen}), 4326):: geography
                        )/1000 AS distancia_km,
                        ST_AsGeoJSON(ST_SetSRID(ST_MakePoint({$mi_lon}, {$mi_lat}), 4326)) AS coords
                        
                
                ;";
    }  
    // d: Centros a distancia máxima
    elseif($inciso == "D") {
        $distancia_metros = $parametro * 1000;
        
        $query = "SELECT nombre, tipo,
                ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography)/1000 AS distancia_km,
                ST_AsGeoJSON(geom) AS coords
              FROM reniecyt2013a
              WHERE (tipo LIKE '%CENTRO PUBLICO%' OR tipo LIKE '%INVESTIGACION%')
              AND ST_DWithin(
                  geom::geography,
                  ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography,
                  {$distancia_metros}
              )
              ORDER BY distancia_km;";
    } 
    // e: Empresas GRANDEs
    elseif($inciso == "E") {
        $distancia_metros = $parametro * 1000;
        
        
        $query = "SELECT nombre, tipo, tamanio,
                ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography)/1000 AS distancia_km,
                ST_AsGeoJSON(geom) AS coords
              FROM reniecyt2013a
              WHERE (tamanio = 'GRANDE' and tipo = 'EMPRESAS') 
              AND ST_DWithin(
                  geom::geography,
                  ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography,
                  {$distancia_metros}
              )
              ORDER BY distancia_km;";
    }  
    // f: PROPUESTA - ST_Buffer. 
    elseif($inciso == "F") {
        $distancia_metros = $parametro * 1000;
        
        $query = "SELECT 'Área de Influencia ({$parametro} km)' AS nombre,
                {$parametro} AS distancia_km,
                ST_AsGeoJSON(
                    ST_Buffer(
                        ST_SetSRID(ST_MakePoint({$punto_origen}), 4326)::geography,
                        {$distancia_metros}
                    )::geometry
                ) AS coords;";
    }
    else {
        die(json_encode(["error" => "Inciso inválido"]));
    }

    $result = pg_query($connection, $query);
    if (!$result) {
      die(json_encode(["error" => pg_last_error($connection)]));
    }

    $resultados = [];
    while($row = pg_fetch_assoc($result)) {
      $row['coords'] = json_decode($row['coords']);
      $geometry = $row['coords'];
      unset($row['coords']);

      $feature = ["type"=>"Feature","geometry"=>$geometry,"properties" => $row];
      array_push($resultados, $feature);
    }
    
    $featureCollection = ["type"=>"FeatureCollection", "features"=>$resultados];
    
    header('Content-Type: application/json');
    echo json_encode($featureCollection);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>