/**
 * Proyecto final - Geoweb
 */

let mapa;
let capaResultados;
let capaEstaciones;
let graficaConcentraciones = null;
let parametrosUltimaConsulta = null;
let ultimosDatosConsultados = []; // Variable global para guardar los datos de la última consulta

// ============================================
// DICCIONARIOS Y MENÚS DINÁMICOS
// ============================================
const gasesPorEstacion = {
    "ACO": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "AJM": ["co", "no2", "o3", "pm10", "pm25", "pmco", "so2"],
    "AJU": ["o3", "no", "nox", "pm25"],
    "ATI": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "BJU": ["co", "no2", "o3", "pm10", "pm25", "pmco", "so2"],
    "CAM": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "pmco", "so2"],
    "CCA": ["co", "no2", "o3", "no", "nox", "pm25", "so2"],
    "CHO": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "COY": [], 
    "CUA": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "CUT": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "FAC": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "FAR": ["co", "no2", "o3", "pm25", "so2"],
    "GAM": ["no2", "o3", "pm10", "pm25", "pmco"],
    "HGM": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "pmco", "so2"],
    "INN": ["co", "o3", "pm10", "pm25", "pmco", "so2"],
    "IZT": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "LLA": ["o3"],
    "LPR": ["co", "o3", "so2"],
    "MER": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "pmco", "so2"],
    "MGH": ["co", "no2", "o3", "no", "nox", "so2"],
    "MON": ["co", "no2", "o3", "no", "nox", "pm25", "so2"],
    "MPA": ["co", "no2", "o3", "pm10", "pm25", "pmco", "so2"],
    "NEZ": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "so2"],
    "PED": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "pmco", "so2"],
    "SAC": ["co", "no2", "o3", "no", "nox", "pm25", "so2"],
    "SAG": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "so2"],
    "SFE": [], 
    "SJA": [], 
    "TAH": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "TLA": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "pmco", "so2"],
    "TLI": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "UAX": ["co", "no2", "o3", "no", "nox", "pm25", "so2"],
    "UIZ": ["co", "no2", "o3", "pm10", "no", "nox", "pm25", "pmco", "so2"],
    "VIF": ["co", "no2", "o3", "pm10", "no", "nox", "so2"],
    "XAL": ["co", "no2", "o3", "no", "nox", "so2"]
};

const nombresGases = {
    "co": "Monóxido de Carbono (CO)",
    "no": "Monóxido de Nitrógeno (NO)",
    "no2": "Dióxido de Nitrógeno (NO2)",
    "nox": "Óxidos de nitrógeno (NOx)",
    "o3": "Ozono (O3)",
    "pm10": "Partículas menores a 10 micrómetros (PM10)",
    "pm25": "Partículas menores a 2.5 micrómetros (PM2.5)",
    "pmco": "Partículas fracción gruesa (PMCO)",
    "so2": "Dióxido de Azufre (SO2)"
};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded ejecutado");

    const formulario = document.getElementById("form-consultas");
    const pantallaResultados = document.getElementById("pantalla-resultados");
    const accionesDescarga = document.getElementById("acciones-descarga");
    const btnDescargarKML = document.getElementById("descargar-kml");
    const selectEstacion = document.getElementById("estacion_rama");
    const selectGas = document.getElementById("gas");

    // 1. Activar menú dinámico de gases
    if (selectEstacion && selectGas){
        selectEstacion.addEventListener("change", (evento) => {
            const estacionSeleccionada = evento.target.value;
            const gasesPermitidos = gasesPorEstacion[estacionSeleccionada] || [];

            selectGas.innerHTML = '<option value="" disabled selected>---- Selecciona un gas ----</option>';

            gasesPermitidos.forEach(gas => {
                const nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = gas;
                nuevaOpcion.textContent = nombresGases[gas];
                selectGas.appendChild(nuevaOpcion);
            });
        });
    }

    // 2. Cargar Mapa y Estaciones Locales
    try {
        inicializarMapa();
        cargarEstacionesLocales();
    } catch (error) {
        console.error("No fue posible inicializar el mapa:", error);
    }

    // 3. Efectos visuales de scroll
    const bloques = document.querySelectorAll(".grid-visor > aside, .grid-visor > main, .grid-visor > footer");
    bloques.forEach((bloque) => bloque.classList.add("revelar"));
    
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    
    bloques.forEach((bloque) => observador.observe(bloque));

    // ============================================
    // LÓGICA DEL FORMULARIO Y CONSULTA A PHP
    // ============================================
    if (formulario) {
        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const estacion_rama = document.getElementById("estacion_rama").value;
            const gas = document.getElementById("gas").value;
            const fecha = document.getElementById("fecha_consulta") ? document.getElementById("fecha_consulta").value : "";
            const hora = document.getElementById("hora_consulta") ? document.getElementById("hora_consulta").value : "";
            const terminos = document.getElementById("terminos").checked;

            // Validaciones
            if (estacion_rama === "") {
                alert("Selecciona una estación de monitoreo.");
                return;
            }
            if (gas === "") {
                alert("Selecciona un contaminante.");
                return;
            }
            if (!terminos) {
                alert("Debes aceptar los términos y condiciones.");
                return;
            }

            // Preparar parámetros para PHP
            const parametros = new URLSearchParams();
            parametros.append("estacion", estacion_rama);
            parametros.append("gas", gas);
            if (fecha !== "") parametros.append("fecha", fecha);
            if (hora !== "") parametros.append("hora", hora);
            parametros.append("formato", "json");

            parametrosUltimaConsulta = new URLSearchParams(parametros.toString());

            pantallaResultados.innerHTML = "<em>Consultando la base de datos...</em>";
            if (accionesDescarga) accionesDescarga.style.display = "none";

            try {
                const respuesta = await fetch("php/consulta_get_pdo.php?" + parametros.toString());
                const textoRespuesta = await respuesta.text();
                
                let resultado;
                try {
                    resultado = JSON.parse(textoRespuesta);
                } catch (error) {
                    throw new Error("El servidor no devolvió JSON válido: " + textoRespuesta.substring(0, 150));
                }

                if (!respuesta.ok || resultado.error) {
                    throw new Error(resultado.error || `Error HTTP ${respuesta.status}`);
                }

                // Guardar datos en la variable global para usarlos al dar clic en descargar
                ultimosDatosConsultados = resultado.datos ?? [];

                mostrarResumen(ultimosDatosConsultados, gas);
                mostrarTabla(ultimosDatosConsultados, gas);
                mostrarEstacionesEnMapa(ultimosDatosConsultados, gas);
                mostrarGrafica(ultimosDatosConsultados, gas);

                // Mostrar el bloque de descarga si hay resultados
                if (ultimosDatosConsultados.length > 0 && accionesDescarga) {
                    accionesDescarga.style.display = "block";
                }

            } catch (error) {
                pantallaResultados.innerHTML = `<span style="color: #A35139;"><strong>Error:</strong> ${error.message}</span>`;
                mostrarTabla([], gas);
                console.error("Error en la consulta:", error);
            }
        });
    }

    // ============================================
    // LÓGICA DEL BOTÓN DE DESCARGA MANUAL
    // ============================================
    if (btnDescargarKML) {
        btnDescargarKML.addEventListener("click", () => {
            if (!ultimosDatosConsultados || ultimosDatosConsultados.length === 0) {
                alert("Primero debes realizar una consulta exitosa para descargar los resultados.");
                return;
            }

            const formatoSeleccionado = document.querySelector('input[name="formato"]:checked');
            const formato = formatoSeleccionado ? formatoSeleccionado.value : "geojson";
            const gas = document.getElementById("gas").value;

            if (formato === 'kml') {
                if (parametrosUltimaConsulta) {
                    window.location.href = "php/consulta_get_pdo.php?" + parametrosUltimaConsulta.toString() + "&formato=kml";
                }
            } else if (formato === 'geojson') {
                descargarGeoJSONNavegador(ultimosDatosConsultados, gas);
            }
        });
    }
});

// ============================================
// FUNCIONES DE INTERFAZ (Tablas, Resumen)
// ============================================
function mostrarResumen(datos, gas) {
    const pantallaResultados = document.getElementById("pantalla-resultados");
    if (!datos || datos.length === 0) {
        pantallaResultados.innerHTML = `No se encontraron mediciones para los filtros seleccionados.`;
        return;
    }
    pantallaResultados.innerHTML = `
        <strong>Consulta realizada correctamente.</strong><br>
        Contaminante seleccionado: ${nombresGases[gas] || gas.toUpperCase()}<br>
        Resultados encontrados: ${datos.length}<br>
        Registros mostrados en la tabla: ${Math.min(datos.length, 100)}
    `;
}

function mostrarTabla(datos, gas) {
    const cuerpoTabla = document.getElementById("tabla-resultados");
    const encabezadoGas = document.getElementById("encabezado-gas");
    if (encabezadoGas) encabezadoGas.textContent = gas ? gas.toUpperCase() : "Concentración";
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = "";

    if (!datos || datos.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="5">No se encontraron resultados.</td></tr>`;
        return;
    }

    const registrosVisibles = datos.slice(0, 100);
    registrosVisibles.forEach((registro) => {
        const fila = document.createElement("tr");
        const valorGas = registro[gas] === null || registro[gas] === undefined ? "Sin dato" : registro[gas];
        fila.innerHTML = `
            <td>${registro.Nombre ?? "Sin nombre"}</td>
            <td>${registro.clave_estacion ?? "Sin clave"}</td>
            <td>${registro.fecha ?? "Sin fecha"}</td>
            <td>${registro.hora ?? "Sin hora"}</td>
            <td>${valorGas}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

// ============================================
// FUNCIONES DE MAPA (Leaflet)
// ============================================
function inicializarMapa() {
    mapa = L.map("map", { center: [19.4326, -99.1332], zoom: 10 });

    const openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; OpenStreetMap'
    });
    const cartoClaro = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20, attribution: '&copy; CARTO'
    });

    openStreetMap.addTo(mapa);
    capaResultados = L.layerGroup().addTo(mapa);
    capaEstaciones = L.layerGroup();

    L.control.scale({ position: "bottomleft", metric: true, imperial: false }).addTo(mapa);

    const arbolBase = {
        label: "<strong>Mapas base</strong>",
        children: [
            { label: "OpenStreetMap", layer: openStreetMap },
            { label: "CartoDB claro", layer: cartoClaro }
        ]
    };

    const arbolCapas = {
        label: "<strong>Capas del geoportal</strong>", selectAllCheckbox: false,
        children: [
            { label: "Consulta RAMA", children: [{ label: "Estación consultada", layer: capaResultados }] },
            { label: "Datos locales", children: [{ label: "Todas las estaciones RAMA", layer: capaEstaciones }] }
        ]
    };

    if (L.control.layers.tree && typeof L.control.layers.tree === "function") {
        L.control.layers.tree(arbolBase, arbolCapas, { collapsed: true, namedToggle: true }).addTo(mapa);
    } else {
        L.control.layers({ "OpenStreetMap": openStreetMap, "CartoDB claro": cartoClaro }, { "Estación consultada": capaResultados }).addTo(mapa);
    }
}

function mostrarEstacionesEnMapa(datos, gas) {
    capaResultados.clearLayers();
    if (!datos || datos.length === 0) return;

    const estacionesAgregadas = new Set();
    const marcadores = [];

    datos.forEach((registro) => {
        const latitud = Number.parseFloat(registro.latitud || 19.4326); 
        const longitud = Number.parseFloat(registro.longitud || -99.1332);
        const clave = registro.clave_estacion;

        if (estacionesAgregadas.has(clave)) return;
        estacionesAgregadas.add(clave);

        const valorGas = registro[gas] === null || registro[gas] === undefined ? "Sin dato" : registro[gas];
        const marcador = L.marker([latitud, longitud]);

        marcador.bindPopup(`
            <strong>${registro.Nombre ?? "Estación RAMA"}</strong><br>
            Clave: ${clave ?? "Sin clave"}<br>
            ${gas.toUpperCase()}: ${valorGas}<br>
            Fecha: ${registro.fecha ?? "Sin fecha"}<br>
            Hora: ${registro.hora ?? "Sin hora"}
        `);
        marcador.addTo(capaResultados);
        marcadores.push(marcador);
    });

    if (marcadores.length > 0) {
        const grupo = L.featureGroup(marcadores);
        mapa.fitBounds(grupo.getBounds(), { padding: [30, 30], maxZoom: 14 }); 
    }
}

// ============================================
// CARGAR CAPA LOCAL DE ESTACIONES
// ============================================
async function cargarEstacionesLocales() {
    try {
        const respuesta = await fetch("rama_stations.geojson");
        if (!respuesta.ok) throw new Error("No se pudo cargar el GeoJSON: " + respuesta.status);
        const geojson = await respuesta.json();

        const estacionesGeojson = L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
                const props = feature.properties || {};
                const lat = Number.parseFloat(props.Latitud || props.latitud);
                const lon = Number.parseFloat(props.Longitud || props.longitud);

                if (Number.isFinite(lat) && Number.isFinite(lon)) {
                    return L.circleMarker([lat, lon], { 
                        radius: 6, 
                        color: "#ffffff", 
                        weight: 2, 
                        fillColor: "#176b68", 
                        fillOpacity: 0.9 
                    });
                }
                return null;
            },
            onEachFeature: (feature, layer) => {
                const propiedades = feature.properties ?? {};
                const nombre = propiedades.Nombre || propiedades.nombre || "Estación RAMA";
                const clave = propiedades.Clave || propiedades.clave || "Sin clave";
                layer.bindPopup(`<strong>${nombre}</strong><br>Clave: ${clave}`);
            }
        });

        capaEstaciones.addLayer(estacionesGeojson);
        capaEstaciones.addTo(mapa); 
        console.log("Capa local cargada y pintada correctamente.");
    } catch (error) {
        console.error("Error al cargar la capa local:", error);
    }
}

// ============================================
// FUNCIÓN DE DESCARGA LOCAL (GeoJSON)
// ============================================
function descargarGeoJSONNavegador(data, gas) {
    let features = data.map(row => {
        const lat = Number.parseFloat(row.latitud) || 19.43;
        const lon = Number.parseFloat(row.longitud) || -99.13;
        return {
            "type": "Feature",
            "geometry": { 
                "type": "Point", 
                "coordinates": [lon, lat] 
            },
            "properties": {
                "estacion": row.Nombre || 'Estación',
                "clave": row.clave_estacion,
                "fecha": row.fecha,
                "hora": row.hora,
                "gas": gas,
                "valor": row[gas] ?? null
            }
        };
    });

    const blob = new Blob([JSON.stringify({ "type": "FeatureCollection", "features": features }, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_estaciones.geojson';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// ============================================
// FUNCIONES DE GRÁFICAS (Chart.js)
// ============================================
function mostrarGrafica(datos, gas) {
    const canvas = document.getElementById("graphCanvas");
    if (!canvas) return;

    if (graficaConcentraciones) {
        graficaConcentraciones.destroy();
        graficaConcentraciones = null;
    }

    const serie = datos
        .map((registro) => ({
            fecha: `${registro.fecha ?? ""} ${registro.hora ?? ""}`,
            valor: Number.parseFloat(registro[gas])
        }))
        .filter((registro) => Number.isFinite(registro.valor))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    if (serie.length === 0) return;

    const serieVisible = serie.slice(-150);
    const unidades = { co: "ppm", no: "ppb", no2: "ppb", nox: "ppb", o3: "ppb", pm10: "µg/m³", pm25: "µg/m³", pmco: "µg/m³", so2: "ppb" };

    graficaConcentraciones = new Chart(canvas, {
        type: "line",
        data: {
            labels: serieVisible.map(registro => registro.fecha),
            datasets: [{
                label: `${gas.toUpperCase()} (${unidades[gas] ?? ""})`,
                data: serieVisible.map(registro => registro.valor),
                borderColor: "#176b68",
                backgroundColor: "rgba(23, 107, 104, 0.15)",
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.25,
                fill: true
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: { legend: { display: true, position: "top" } }
        }
    });
}
