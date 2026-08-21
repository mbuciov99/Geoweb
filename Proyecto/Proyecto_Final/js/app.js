/**
 * Proyecto final de GeoWeb
 * Consulta de mediciones de la RAMA
 */

let mapa;
let capaResultados;
let graficaConcentraciones = null;
let parametrosUltimaConsulta = null;

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOMContentLoaded ejecutado");

    // Elementos principales del HTML
    const formulario =
        document.getElementById("form-consultas");

    const pantallaResultados =
        document.getElementById("pantalla-resultados");

    const accionesDescarga =
        document.getElementById("acciones-descarga");

    console.log("Formulario:", formulario);
    console.log("Pantalla:", pantallaResultados);
    console.log("Descargas:", accionesDescarga);

    try {
        inicializarMapa();
    } catch (error) {
        console.error("No fue posible inicializar el mapa:", error);
    }


    // Escuchar el envío del formulario
    formulario.addEventListener("submit", async (evento) => {

        // Evitar que la página se recargue
        evento.preventDefault();

        // Recuperar valores del formulario
        const estacion = document.getElementById("estacion").value.trim();
        const latitud = document.getElementById("latitud").value.trim();
        const longitud = document.getElementById("longitud").value.trim();
        const gas = document.getElementById("gas").value;
        const terminos = document.getElementById("terminos").checked;

        // Validar contaminante
        if (gas === "") {
            alert("Selecciona un contaminante.");
            return;
        }

        // Validar que las coordenadas se proporcionen juntas
        if (
            (latitud !== "" && longitud === "") ||
            (latitud === "" && longitud !== "")
        ) {
            alert("Debes proporcionar la latitud y la longitud.");
            return;
        }

        // Validar términos y condiciones
        if (!terminos) {
            alert("Debes aceptar los términos y condiciones.");
            return;
        }

        // Preparar parámetros para PHP
        const parametros = new URLSearchParams();

        parametros.append("estacion", estacion);
        parametros.append("latitud", latitud);
        parametros.append("longitud", longitud);
        parametros.append("gas", gas);
        parametrosUltimaConsulta =
            new URLSearchParams(parametros.toString());

        // Informar que comenzó la consulta
        pantallaResultados.innerHTML =
            "<em>Consultando la base de datos...</em>";

        // Ocultar botones mientras se consulta
        accionesDescarga.style.display = "none";

        try {

            // Petición al PHP ubicado en la carpeta php
            const respuesta = await fetch(
                "php/consulta_get_pdo.php?" + parametros.toString()
            );

            // Leer primero como texto para identificar errores de PHP
            const textoRespuesta = await respuesta.text();

            console.log(
                "Respuesta recibida del PHP:",
                textoRespuesta
            );

            let resultado;

            // Convertir la respuesta a JSON
            try {
                resultado = JSON.parse(textoRespuesta);
            } catch (error) {
                throw new Error(
                    "El servidor no devolvió JSON. Respuesta: " +
                    textoRespuesta.substring(0, 300)
                );
            }

            // Revisar errores del servidor o de PHP
            if (!respuesta.ok || resultado.error) {
                throw new Error(
                    resultado.error ||
                    `Error HTTP ${respuesta.status}: ${textoRespuesta}`
                );
            }

            // Recuperar registros
            const datos = resultado.datos ?? [];

            // Actualizar resumen y tabla
            mostrarResumen(datos, gas);
            mostrarTabla(datos, gas);
            mostrarEstacionesEnMapa(datos, gas);
            mostrarGrafica(datos, gas);

            // Mostrar botones si existen resultados
            if (datos.length > 0) {
                accionesDescarga.style.display = "block";
            }

        } catch (error) {

            pantallaResultados.innerHTML = `
                <span style="color: #A35139;">
                    <strong>Error:</strong> ${error.message}
                </span>
            `;

            mostrarTabla([], gas);

            console.error("Error en la consulta:", error);
        }
    });
});


/**
 * Muestra un resumen de la consulta.
 */
function mostrarResumen(datos, gas) {

    const pantallaResultados =
        document.getElementById("pantalla-resultados");

    if (!datos || datos.length === 0) {
        pantallaResultados.innerHTML = `
            No se encontraron mediciones para los filtros seleccionados.
        `;
        return;
    }

    pantallaResultados.innerHTML = `
        <strong>Consulta realizada correctamente.</strong><br>
        Contaminante seleccionado: ${gas.toUpperCase()}<br>
        Resultados encontrados: ${datos.length}<br>
        Registros mostrados en la tabla:
        ${Math.min(datos.length, 100)}
    `;
}


/**
 * Llena la tabla con los resultados.
 */
function mostrarTabla(datos, gas) {

    const cuerpoTabla =
        document.getElementById("tabla-resultados");

    const encabezadoGas =
        document.getElementById("encabezado-gas");

    // Cambiar el encabezado según el contaminante
    encabezadoGas.textContent =
        gas ? gas.toUpperCase() : "Concentración";

    // Eliminar resultados anteriores
    cuerpoTabla.innerHTML = "";

    // Mostrar mensaje cuando no existen datos
    if (!datos || datos.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="5">
                    No se encontraron resultados.
                </td>
            </tr>
        `;
        return;
    }

    // Evitar colocar miles de filas en el navegador
    const registrosVisibles = datos.slice(0, 100);

    registrosVisibles.forEach((registro) => {

        const fila = document.createElement("tr");

        const valorGas =
            registro[gas] === null ||
            registro[gas] === undefined
                ? "Sin dato"
                : registro[gas];

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


function inicializarMapa() {

    // Crear el mapa
    mapa = L.map("map", {
        center: [19.4326, -99.1332],
        zoom: 10
    });

    // Primer mapa base
    const openStreetMap = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    );

    // Segundo mapa base
    const cartoClaro = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 20,
            attribution:
                '&copy; OpenStreetMap &copy; CARTO'
        }
    );

    // Mostrar inicialmente OpenStreetMap
    openStreetMap.addTo(mapa);

    // Capa donde aparecerá la estación consultada
    capaResultados = L.layerGroup().addTo(mapa);

    // Escala
    L.control.scale({
        position: "bottomleft",
        metric: true,
        imperial: false
    }).addTo(mapa);

    // Árbol de mapas base
    const arbolBase = {
        label: "<strong>Mapas base</strong>",
        children: [
            {
                label: "OpenStreetMap",
                layer: openStreetMap
            },
            {
                label: "CartoDB claro",
                layer: cartoClaro
            }
        ]
    };

    // Árbol de capas superpuestas
    const arbolCapas = {
        label: "<strong>Capas del geoportal</strong>",
        selectAllCheckbox: false,
        children: [
            {
                label: "Consulta RAMA",
                children: [
                    {
                        label: "Estación consultada",
                        layer: capaResultados
                    }
                ]
            }
        ]
    };

    // Usar el plugin si cargó correctamente
    if (
        L.control.layers.tree &&
        typeof L.control.layers.tree === "function"
    ) {

        L.control.layers.tree(
            arbolBase,
            arbolCapas,
            {
                collapsed: true,
                namedToggle: true,
                collapseAll: "Cerrar grupos",
                expandAll: "Abrir grupos"
            }
        ).addTo(mapa);

        console.log(
            "Leaflet.Control.Layers.Tree cargado correctamente."
        );

    } else {

        // Control normal si el plugin no carga
        L.control.layers(
            {
                "OpenStreetMap": openStreetMap,
                "CartoDB claro": cartoClaro
            },
            {
                "Estación consultada": capaResultados
            }
        ).addTo(mapa);

        console.warn(
            "El árbol de capas no cargó; se utilizó el control normal."
        );
    }
}
   

function mostrarEstacionesEnMapa(datos, gas) {

    capaResultados.clearLayers();

    if (!datos || datos.length === 0) {
        return;
    }

    const estacionesAgregadas = new Set();
    const marcadores = [];

    datos.forEach((registro) => {

        const latitud = Number.parseFloat(registro.latitud);
        const longitud = Number.parseFloat(registro.longitud);
        const clave = registro.clave_estacion;

        if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
            return;
        }

        if (estacionesAgregadas.has(clave)) {
            return;
        }

        estacionesAgregadas.add(clave);

        const valorGas =
            registro[gas] === null ||
            registro[gas] === undefined
                ? "Sin dato"
                : registro[gas];

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

        mapa.fitBounds(grupo.getBounds(), {
            padding: [30, 30],
            maxZoom: 14
        });
    }
}
/**
 * Hace aparecer las secciones al desplazarse por la página.
 */
document.addEventListener("DOMContentLoaded", () => {

    const bloques = document.querySelectorAll(
        ".grid-visor > aside, " +
        ".grid-visor > main, " +
        ".grid-visor > footer"
    );

    bloques.forEach((bloque) => {
        bloque.classList.add("revelar");
    });

    const observador = new IntersectionObserver(
        (entradas) => {

            entradas.forEach((entrada) => {

                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    bloques.forEach((bloque) => {
        observador.observe(bloque);
    });
});

/**
 * Genera una gráfica temporal de las concentraciones.
 */
function mostrarGrafica(datos, gas) {

    const canvas = document.getElementById("graphCanvas");

    if (!canvas) {
        console.warn("No se encontró graphCanvas.");
        return;
    }

    // Eliminar la gráfica anterior
    if (graficaConcentraciones) {
        graficaConcentraciones.destroy();
        graficaConcentraciones = null;
    }

    // Preparar solamente mediciones numéricas
    const serie = datos
        .map((registro) => ({
            fecha: `${registro.fecha ?? ""} ${registro.hora ?? ""}`,
            valor: Number.parseFloat(registro[gas])
        }))
        .filter((registro) => Number.isFinite(registro.valor))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    if (serie.length === 0) {
        console.warn("No existen valores numéricos para graficar.");
        return;
    }

    // Mostrar como máximo las últimas 150 mediciones
    const serieVisible = serie.slice(-150);

    const unidades = {
        co: "ppm",
        no: "ppb",
        no2: "ppb",
        nox: "ppb",
        o3: "ppb",
        pm10: "µg/m³",
        pm25: "µg/m³",
        pmco: "µg/m³",
        so2: "ppb"
    };

    graficaConcentraciones = new Chart(canvas, {
        type: "line",

        data: {
            labels: serieVisible.map(
                registro => registro.fecha
            ),

            datasets: [
                {
                    label:
                        `${gas.toUpperCase()} (${unidades[gas] ?? ""})`,

                    data: serieVisible.map(
                        registro => registro.valor
                    ),

                    borderColor: "#176b68",
                    backgroundColor: "rgba(23, 107, 104, 0.15)",

                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    tension: 0.25,
                    fill: true
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    display: true,
                    position: "top"
                },

                tooltip: {
                    callbacks: {
                        label: (contexto) => {
                            return (
                                `${gas.toUpperCase()}: ` +
                                `${contexto.parsed.y} ` +
                                `${unidades[gas] ?? ""}`
                            );
                        }
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 10,
                        maxRotation: 45,
                        minRotation: 0
                    },

                    title: {
                        display: true,
                        text: "Fecha y hora"
                    }
                },

                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text:
                            `Concentración (${unidades[gas] ?? ""})`
                    }
                }
            }
        }
    });
}
