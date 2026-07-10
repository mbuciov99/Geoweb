var map = L.map('map').setView([19.35, -99.15], 10);
var capaActual = null; // Variable para guardar la capa que esté activa y poder borrarla

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Función para limpiar el mapa y la caja de texto antes de cargar otra cosa
function limpiarTodo() {
    if (capaActual) {
        map.removeLayer(capaActual);
    }
    $('#contenido').html('');
}

//PARTE 1: INSTITUCIONES//

$('#btn-parte1').click(function() {
    $('.menu-secundario').hide(); 
    $('#menu-parte1').show();     
    limpiarTodo();
});

$('#form_parte1').submit(function(e) {
    e.preventDefault();
    var texto = $('#busqueda').val().trim();
    var tam = $('#tamanio').val();

    if(texto === "" || tam === "") {
        alert("Por favor llena los dos campos."); return false;
    }

    limpiarTodo();
    $.ajax({
        type: "GET", 
        url: 'php/listaInst_geojson.php', 
        data: { palabra: texto, tamanio: tam }, 
        dataType: 'json',
        success: function(res) {
            // 1. Dibujamos los puntos en el mapa con los colores de tu compañera
            capaActual = L.geoJson(res, {
                pointToLayer: function(f, latlng) {
                    var tipo = f.properties.tipo;
                    if(tipo === "CENTROS DE INVESTIGACION") {
                        return L.circleMarker(latlng, {color:"#9400d3", radius: 8, weight:2, fillOpacity: 0.7});
                    } else if(tipo === "EMPRESAS") {
                        return L.circleMarker(latlng, {color:"#00FF00", radius: 8, weight:2, fillOpacity: 0.7});
                    } else if(tipo ==="INSTITUCIONES DE ENSEÑANZA SUPERIOR") {
                        return L.circleMarker(latlng, {color:"#0000FF", radius: 8, weight:2, fillOpacity: 0.7});
                    } else if(tipo ==="INSTITUCIONES DE LA ADMINISTRACION PUBLICA") {
                        return L.circleMarker(latlng, {color:"#FF8C00", radius: 8, weight:2, fillOpacity: 0.7});
                    } else if(tipo ==="INSTITUCIONES PRIVADAS NO LUCRATIVAS") {
                        return L.circleMarker(latlng, {color:"#FF1493", radius: 8, weight: 2, fillOpacity: 0.7});
                    } else if (tipo === "PERSONA FISICA"){
                        return L.circleMarker(latlng, {color:"#00FFFF", radius: 8, weight: 2, fillOpacity: 0.7});
                    } else {
                        return L.circleMarker(latlng, {color:"#76578", radius: 6, weight:2, fillOpacity: 0.5});
                    }
                },
                onEachFeature: function(f, l) { l.bindPopup("<b>"+f.properties.nombre+"</b><br>"+f.properties.tamanio); }
            }).addTo(map);

            // 2. Mostramos la información en la caja de texto
            if(res.features.length > 0) {
                var contenido_html = "";
                for(var i = 0; i < res.features.length; i++) {
                    var props = res.features[i].properties;
                    contenido_html += "Nombre: " + props.nombre + "<br/>";
                    contenido_html += "Tipo: " + props.tipo + "<br/>";
                    contenido_html += "Municipio: " + props.delmun + "<br/>";
                    contenido_html += "Entidad: " + props.entidad + "<br/>";
                    contenido_html += "Sector: " + props.sector + "<br/>";
                    contenido_html += "Rama: " + props.rama + "<br/>";
                    contenido_html += "Clase: " + props.clase + "<br/>";
                    contenido_html += "<hr/>";
                }
                $('#contenido').html(contenido_html);
            } else {
                $('#contenido').html("La consulta no tiene resultados");
            }
        },
        error: function(jqXHR, estado, error) {
            $('#contenido').html('Error al cargar datos: ' + error);
        }
    });
});


//PARTE 2: VULNERABILIDAD// 
$('#btn-parte2').click(function() {
    $('.menu-secundario').hide(); 
    $('#menu-parte2').show();
    limpiarTodo();
    $('#contenido').html('Cargando mapa de vulnerabilidad...');

    $.ajax({
        type: "GET", url: 'php/alcaldias_geojson.php', dataType: 'json',
        success: function(res) {

    capaActual = L.geoJson(res, {
        style: function(feature) {

            switch(feature.properties.vul_social) {
                case 'Muy alto':
                    return { fillColor: '#800026', weight: 2, color: 'white', fillOpacity: 0.7 };
                case 'Alto':
                    return { fillColor: '#BD0026', weight: 2, color: 'white', fillOpacity: 0.7 };
                case 'Medio':
                    return { fillColor: '#FD8D3C', weight: 2, color: 'white', fillOpacity: 0.7 };
                case 'Bajo':
                    return { fillColor: '#FEB24C', weight: 2, color: 'white', fillOpacity: 0.7 };
                case 'Muy bajo':
                    return { fillColor: '#FFEDA0', weight: 2, color: 'white', fillOpacity: 0.7 };
                default:
                    return { fillColor: '#ccc', weight: 2, color: 'white', fillOpacity: 0.7 };
            }
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                "<b>" + feature.properties.nomgeo + "</b><br>" +
                "Vulnerabilidad: " + feature.properties.vul_social
            );
        }
    }).addTo(map);

    $('#contenido').html(
        "Se cargaron " + res.features.length + " alcaldías."
    );
}
    });
});


//PARTE 3: POBLACIÓN//
$('#btn-parte3').click(function() {
    $('.menu-secundario').hide();
    $('#menu-parte3').show();
    limpiarTodo();
});

$('.btn-filtro-pob').click(function() {
    var letraFiltro = $(this).data('filtro'); // Lee si es a, b, c, d, e o f
    limpiarTodo();
    
    $.ajax({
        type: "GET", url: 'php/alcaldias_pob.php', data: { filtro: letraFiltro }, dataType: 'json',
        success: function(res) {
            capaActual = L.geoJson(res, {
                style: { fillColor: '#2b8cbe', weight: 2, color: 'white', fillOpacity: 0.6 },
                onEachFeature: function(f, l) { l.bindPopup("<b>"+f.properties.nomgeo+"</b><br>Población: "+f.properties.pob_2015); }
            }).addTo(map);
            $('#contenido').html("Se encontraron " + res.features.length + " alcaldías con este filtro.");
        }
    });
});