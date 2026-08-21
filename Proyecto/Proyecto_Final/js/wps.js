document.addEventListener("DOMContentLoaded", () => {

    if (
        typeof L === "undefined" ||
        typeof mapa === "undefined" ||
        !mapa ||
        typeof L.Control.Draw !== "function"
    ) {
        console.error(
            "No fue posible inicializar la herramienta WPS de dibujo."
        );
        return;
    }

    const poligonosDibujados =
        new L.FeatureGroup();

    mapa.addLayer(poligonosDibujados);

    const controlDibujo =
        new L.Control.Draw({
            edit: {
                featureGroup: poligonosDibujados
            },

            draw: {
                polygon: true,
                rectangle: true,
                circle: false,
                marker: false,
                circlemarker: false,
                polyline: false
            }
        });

    mapa.addControl(controlDibujo);

    mapa.on(
        L.Draw.Event.CREATED,
        evento => {

            const layer = evento.layer;

            poligonosDibujados.clearLayers();
            poligonosDibujados.addLayer(layer);

            ejecutarFiltroEspacialRama(
                layer.toGeoJSON()
            );
        }
    );

    console.log(
        "Herramienta de filtro espacial WPS inicializada."
    );
});
let capaFiltroWps = null;

async function ejecutarFiltroEspacialRama(poligonoGeojson) {

    const pantalla =
        document.getElementById("pantalla-resultados");

    try {
        const geometria = poligonoGeojson.geometry;

        if (!geometria || geometria.type !== "Polygon") {
            throw new Error(
                "La geometría dibujada no es un polígono."
            );
        }

        const anillos = geometria.coordinates.map(anillo => {
            const puntos = anillo.map(
                coordenada =>
                    `${coordenada[0]} ${coordenada[1]}`
            );

            return `(${puntos.join(",")})`;
        });

        const wkt = `POLYGON(${anillos.join(",")})`;

        const parametros = new URLSearchParams({
            service: "WPS",
            version: "1.0.0",
            request: "Execute",
            identifier: "FiltroEspacialRAMA",
            DataInputs: `geo=${wkt}`,
            RawDataOutput: "resultado"
        });

        pantalla.innerHTML =
            "<em>Ejecutando consulta espacial WPS...</em>";

        const respuesta = await fetch(
            `/pywps?${parametros.toString()}`
        );

        const texto = await respuesta.text();

        if (!respuesta.ok) {
            throw new Error(
                `El WPS respondió con HTTP ${respuesta.status}`
            );
        }

        let resultado;

        try {
            resultado = JSON.parse(texto);
        } catch (error) {
            throw new Error(
                "El WPS no devolvió un GeoJSON válido."
            );
        }

        if (resultado.error) {
            throw new Error(resultado.error);
        }

        if (!capaFiltroWps) {
            capaFiltroWps = L.layerGroup().addTo(mapa);
        }

        capaFiltroWps.clearLayers();

        const puntos = L.geoJSON(resultado, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: 9,
                    color: "#ffffff",
                    weight: 2,
                    fillColor: "#e63946",
                    fillOpacity: 0.95
                });
            },

            onEachFeature: (feature, layer) => {
                const p = feature.properties ?? {};

                layer.bindPopup(`
                    <strong>${p.nombre ?? "Estación RAMA"}</strong><br>
                    Clave: ${p.clave ?? "Sin clave"}<br>
                    Municipio: ${p.municipio ?? "Sin dato"}<br>
                    Estado: ${p.estado ?? "Sin dato"}<br>
                    <small>Resultado de PyWPS y PostGIS</small>
                `);
            }
        });

        capaFiltroWps.addLayer(puntos);

        const estaciones = resultado.features ?? [];

        const filas = estaciones.map(feature => {
            const p = feature.properties ?? {};

            return `
                <tr>
                    <td>${p.nombre ?? "Sin nombre"}</td>
                    <td>${p.clave ?? "Sin clave"}</td>
                    <td>${p.municipio ?? "Sin dato"}</td>
                    <td>${p.estado ?? "Sin dato"}</td>
                </tr>
            `;
        }).join("");

        pantalla.innerHTML = `
            <strong>Filtro espacial WPS completado.</strong><br>
            Estaciones encontradas: ${estaciones.length}

            ${
                estaciones.length > 0
                    ? `
                        <div class="tabla-geo-wrapper">
                            <table class="tabla-geo">
                                <thead>
                                    <tr>
                                        <th>Estación</th>
                                        <th>Clave</th>
                                        <th>Municipio</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>${filas}</tbody>
                            </table>
                        </div>
                    `
                    : "<p>No hay estaciones dentro del polígono.</p>"
            }
        `;

        console.log(
            `WPS: ${estaciones.length} estaciones encontradas.`
        );

    } catch (error) {
        console.error("Error WPS:", error);

        pantalla.innerHTML = `
            <span style="color: #A35139;">
                <strong>Error WPS:</strong> ${error.message}
            </span>
        `;
    }
}
