// Inicializar el mapa
var map = L.map('map').setView([19.35, -99.15], 10);
var capaActual = null; 

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function limpiarTodo() {
    if (capaActual) {
        map.removeLayer(capaActual);
    }
    $('#contenido').html('');
}

// Función para cambiar de dropdown (Cantidad vs Kilómetros) según el inciso
function toggleOpciones() {
    const inciso = document.querySelector('input[name="tipo_busqueda"]:checked').value;
    if(inciso === 'A' || inciso === 'B') {
        document.getElementById('div_cantidad').style.display = 'block';
        document.getElementById('div_distancia').style.display = 'none';
    } else if (inciso === 'D' ||  inciso=== 'E' || inciso === 'F') {
        document.getElementById('div_cantidad').style.display = 'none';
        document.getElementById('div_distancia').style.display = 'block';
    } else {
        // En el inciso C (Domicilio) 
        document.getElementById('div_cantidad').style.display = 'none';
        document.getElementById('div_distancia').style.display = 'none';
    }
}

function buscarDatos() {
    const incisoSeleccionado = document.querySelector('input[name="tipo_busqueda"]:checked').value;
    
    // Obtener el parámetro correcto según el formulario activo
    let parametro = 0;
    if(incisoSeleccionado === 'A' || incisoSeleccionado === 'B') {
        parametro = document.getElementById('cantidad').value;
    } else if (incisoSeleccionado === 'D' || incisoSeleccionado === 'E' || incisoSeleccionado === 'F') {
        parametro = document.getElementById('distancia').value;
    }
    
    const sede = document.getElementById('sede').value;
    
    const url = `php/consultas.php?inciso=${incisoSeleccionado}&parametro=${parametro}&sede=${sede}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos:", data);
            if(data.error) {
                alert("Error: " + data.error);
                return;
            }

            // 1. Limpiamos el mapa y el contenedor de texto
            limpiarTodo();

            // 2. Llenar de nuevo el cuadro de texto #contenido con los resultados
            let htmlResultados = "<h3>Resultados encontrados:</h3><ul>";
            data.features.forEach(feature => {
                htmlResultados += `<li><strong>${feature.properties.nombre}</strong>`;
                if(feature.properties.distancia_km !== undefined) {
                    htmlResultados += ` (a ${parseFloat(feature.properties.distancia_km).toFixed(2)} km)`;
                }
                htmlResultados += `</li>`;
            });
            htmlResultados += "</ul>";
            
            // Inyectamos el HTML creado en el div
            $('#contenido').html(htmlResultados);

            // 3. Dibujar las geometrías en el mapa
            capaActual = L.geoJSON(data, {
                style: function (feature) {
                    // Si devolvemos el polígono Buffer (F) lo pintamos de azul semitransparente
                    if(feature.geometry.type === 'Polygon') {
                        return { color: "#3388ff", weight: 2, fillOpacity: 0.2 };
                    }
                    // Si devolvemos la línea del Domicilio (C) la pintamos roja
                    if(feature.geometry.type === 'LineString') {
                        return { color: "#e74c3c", weight: 4 };
                    }
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.nombre) {
                        let popupContent = `<b>${feature.properties.nombre}</b><br/>`;
                        if (feature.properties.distancia_km !== undefined) {
                           popupContent += `Distancia: ${parseFloat(feature.properties.distancia_km).toFixed(2)} km`;
                        }
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(map);

            // 4. Ajustar el zoom del mapa para que abarque los resultados
            if (capaActual.getLayers().length > 0) {
                map.fitBounds(capaActual.getBounds());
            } else {
                $('#contenido').html('<p>No se encontraron resultados para esta búsqueda.</p>');
                alert("No se encontraron resultados para esta búsqueda.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            $('#contenido').html('<p style="color:red;">Ocurrió un error al consultar los datos.</p>');
        });
}