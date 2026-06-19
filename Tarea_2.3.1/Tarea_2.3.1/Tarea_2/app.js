/**
 * TAREA 2 - Geoweb
 */

//*A. Estructura condicional múltiple

function evaluarCalidadAireNO2(medicion) {
    let diagnostico = "";

    if (medicion >= 150) {
        diagnostico = "Calidad del aire: Crítica";
    } else if (medicion >= 100) {
        diagnostico = "Calidad del aire: Regular";
    } else {
        diagnostico = "Calidad del aire: Buena";
    }
    
    return diagnostico; // C (retornar valor)
}

// B. Al menos dos estructuras iterativas con operadores lógicos
/* ESTRUCTURA ITERATIVA 1: Bucle 'for' con operador lógico '&&' (AND).*/
function filtrarMedicionesAnomalas(mediciones) {
    let medicionesValidas = [];

    for (let i = 0; i < mediciones.length; i++) {
        // Operador lógico &&: La lectura es válida solo si es mayor a 0 Y menor o igual a 500 ppb
        if (mediciones[i] > 0 && mediciones[i] <= 500) {
            medicionesValidas.push(mediciones[i]);  
        }
    }
    return medicionesValidas;
}

 /* ESTRUCTURA ITERATIVA 2: Bucle 'while' con operador lógico OR.
 * Función con ARGUMENTOS VARIABLES 
 */
function analizarCalidadAire(...valoresSatelitales) {
    // Si no se envían argumentos, retornamos un mensaje por defecto
    if (valoresSatelitales.length === 0) {
        return "No hay datos satelitales para analizar.";
    }

    let i = 0;
    let alertaDetectada = false;

    // Iteramos mientras haya elementos Y no hayamos encontrado una alerta
    while (i < valoresSatelitales.length && alertaDetectada === false) {
        
        // Operador lógico ||: Se dispara alerta si el valor es negativo (error) O supera los 120 ppb (peligro)
        if (valoresSatelitales[i] < 0 || valoresSatelitales[i] > 120) {
            alertaDetectada = true;
        }
        i++;
    }

    if (alertaDetectada) {
        return "¡Alerta! Se detectaron valores críticos o erróneos en el muestreo satelital.";
    } else {
        return "Valores dentro del rango nominal permitido.";
    }
}

/* Pruebas de ejecución (Mostrando los resultados en la página HTML)
*Con una variable de texto vacía se va guardando todo. 
*<br> para que el HTML haga saltos de línea
*/

let textoResultados = "";

textoResultados += "<strong>--- Punto A y C: Condicional Múltiple ---</strong><br>";
textoResultados += "Lectura 160 ppb: " + evaluarCalidadAireNO2(160) + "<br>";
textoResultados += "Lectura 85 ppb: " + evaluarCalidadAireNO2(85) + "<br><br>";

let muestrasEstacion = [35.2, -5.0, 42.1, 800.5, 28.4]; 
textoResultados += "<strong>--- Punto B: Filtrado de Anomalías (for + &&) ---</strong><br>";
const filtradas = filtrarMedicionesAnomalas(muestrasEstacion);
textoResultados += "Muestras validadas: " + filtradas + "<br><br>";

textoResultados += "<strong>--- Punto B y C: Análisis Satelital (while + or) ---</strong><br>";
textoResultados += "Análisis zona Centro: " + analizarCalidadAire(35.0, 130.5, 40.0) + "<br><br>";

textoResultados += "<strong>--- Punto D: Reporte de lecturas válidas (array)---</strong><br>";
const sorteadas = filtradas.sort();
textoResultados += "Cantidad de muestras válidas: " + sorteadas.length + "<br>";
textoResultados += "Valor mínimo: " + Math.min(...sorteadas) + "<br>";
textoResultados += "Valor máximo: " + Math.max(...sorteadas) + "<br>";
textoResultados += "Muestras ordenadas: " + sorteadas.join(", ") + "<br><br>";

textoResultados += "<strong>--- Punto E: Resultado: Calidad del aire ---</strong><br>";
const encadenadas = [];

sorteadas.forEach(num => {
    let calidad = "";
    if (num <= 50) {
        calidad = "Buena";
    } else if (num <= 100) {
        calidad = "Moderada";
    } else {
        calidad = "Mala";
    }
    encadenadas.push(`${num} ppb - ${calidad}`);
});

textoResultados += "Reporte: " + encadenadas.join(" | ") + "<br>";

// Se busca etiqueta por su ID y se integra el texto
document.getElementById("pantalla-resultados").innerHTML = textoResultados;

// Validación del formulario y apertura de ventana

// Escuchar el evento DOMContentLoaded para asegurar que el HTML esté listo
document.addEventListener("DOMContentLoaded", () => {
    console.log("El DOM ha sido completamente cargado. El validador está listo.");

    // Buscar el formulario geoespacial por su clase
    const formulario= document.querySelector(".formulario-geo");

    if (formulario) {
        // Escuchar el evento cuando el usuario da clic en "Enviar solicitud"
        formulario.addEventListener("submit", (evento) => {
            // Evitar que la pagina se cargue de golpe y borre datos
            evento.preventDefault();

            // Captura de los datos de validación
            const nombre= document.getElementById("nombre").value.trim();
            const latitud= document.getElementById("lat").value.trim();
            const longitud= document.getElementById("lon").value.trim();
            const clave= document.getElementById("clave-api").value.trim();
            const correo= document.getElementById("correo").value.trim();
            const terminos= document.getElementById("terminos").checked;

            // Validación de campos obligatorios
            if (nombre == "" || latitud == "" || longitud == "") {
                alert("Error: Los campos de Nombre, Latitud y Longitud son obligatorios.");
                return; // Detener la ejecución
            }

            if (clave.length < 6) {
                alert("Error: La contraseña debe tener al menos 6 caracteres");
                return;
            }

            if (!terminos) {
                alert("Error: Debes aceptar los términos y condiciones para descargar datos de TEMPO");
                return;
            }

            // Si todo es correcto, se abre una nueva ventana
            const nuevaVentana= window.open("", "_blank", "width= 600, height= 400");

            //Contenido dinámico de HTML para esta nueva ventada
            nuevaVentana.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                    <head>
                        <meta charset= "UTF-8">
                        <title>Validación de Solicitud Exitosa</title>
                        <style>
                            body {
                                background-color: #1B2632;
                                color: #F0F3F5;
                                font-family: sans-serif;
                                padding: 30px;
                            }
                            h1 { color: #D9C5A7; border-bottom: #2C3B4D; padding: 20px; border-radius: 8px; border: 1px solid #3A4A5E; }
                            .tarjeta { background-color: #2C3B4D; padding: 20px; border-radius: 8px; border: 1px solid #3A4A5E; }
                            .exito { color: #43a047; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <h1>
                            <span> Misión Validada </span>
                        </h1>
                        <p class="exito">Todos los campos del formulario pasaron la validación de seguridad.</p>
                        <div class="tarjeta">
                            <h3>Resumen de Registro Geoespacial:</h3>
                            <p><strong>Investigador/Estación:</strong>${nombre}</p>
                            <p><strong>Coordenadas de consulta:</strong>Lat:${latitud},${longitud}</p>
                            <p><strong>Estatus de Clave:</strong>Validada (Protegida)</p>
                        </div>
                        </br>
                        <button onclick= "window.close()">Cerrar ventana</button>
                    </body>
                </html>`

            );
            // Se cierra el flujo de escritura de la ventana nueva
        });
    }
});

// Eventos del Mouse y IU)

document.addEventListener("DOMContentLoaded", () => {

    // Evento: Click
    const btnClick= document.getElementById("btn-click");

    btnClick.addEventListener("click", () => {
        btnClick.textContent= "¡Mapa Centrado!";
        btnClick.style.backgroundColor= "#43a047"; // cambio a verde de éxito!
        console.log("Evento 'click' ejecutado: Mapa centrado en coordendas de CDMX.");

        // Devolver el texto original despues de 1.5s
        setTimeout(() => {
            btnClick.textContent= "Centrar Mapa (Click)";
            btnClick.style.backgroundColor= "#A35139";
        }, 1500);
    }); // <--- ¡AQUÍ SE CIERRA EL EVENTO CLICK CORRECTAMENTE!


    // Evento: Double Click
    const btnDblClick= document.getElementById("btn-doubleclick");
    btnDblClick.addEventListener("dblclick", () => {
        alert("Visor Reiniciado: Se han limpiado las capas temporales del satélite.");
        console.log("Evento 'dblclick' ejecutado: Visor devuelto al estado predeterminado.");
    });

    // Evento: Mousedown (presionar click)
    const btnPresion= document.getElementById("btn-presion");
    btnPresion.addEventListener("mousedown", () => {
        btnPresion.style.backgroundColor= "#D9C5A7";
        btnPresion.style.color= "#1B2632";
        btnPresion.textContent= "Calibrando rayo laser del sensor ... NO SUELTES!";
        console.log("Evento 'mousedowns' activado.");
    });

    // Evento: Mouseover (Pasar el cursor por encima)
    const zonaRadar= document.getElementById("zona-radar");
    const textRadar= document.getElementById("texto-radar");

    zonaRadar.addEventListener("mouseover", () => {
        zonaRadar.style.borderColor= "#A35139";
        textRadar.textContent= "Radar Activo: Escaneando pixeles...";
        textRadar.style.color= "#F0F3F5"; //
        console.log("Evento 'moseover' activado");
    });

    // Evento: Mouseout (Sacar cursor del evento)
    zonaRadar.addEventListener("mouseout", () => {
        zonaRadar.style.borderColor= "#3A4A5E";
        textRadar.textContent= "Radar Apagado (mouseover)";
        textRadar.style.color= "#7A8B9F";
        document.getElementById("coordenadas-radar").textContent= ""; // Corregido: la 'c' minúscula de coordenadas-radar
        console.log("Evento 'mouseout' activado.");
    });

    // Evento: mousemove
    const coordsRadar= document.getElementById("coordenadas-radar");
    zonaRadar.addEventListener("mousemove", (propiedades) => {
        // obtener la posición del mouse relativa a la caja radar
        let x= propiedades.offsetX;
        let y= propiedades.offsetY;
        coordsRadar.textContent= `X-Sat: ${x}px | Y-Sat: ${y}px (Procesando matriz...)`;
    });

    // Evento: Change
    const selectorCapas= document.getElementById("selector-capas");
    selectorCapas.addEventListener("change", (e) => {
        const capaSeleccionada= e.target.value;
        console.log(`Evento 'change' activado. Nueva capa: ${capaSeleccionada}`);

        if (capaSeleccionada == "predeterminado") {
            alert(`Cargando desde Dataspace: ${e.target.options[e.target.selectedIndex].text}`);
        }
    });

    // Evento: Submit (Formulario de consulta de clase de institución)
    document.getElementById("btn-consultar-clase").addEventListener("click", async () => {
        
        const URL = 'listaInst_post_pdo.php';
        const tipo = document.querySelector('#tipo_inst option:checked').text;
        
        let data = new URLSearchParams();
        data.append('tipo', tipo);

        // Seleccionamos la pantalla de resultados 
        const pantallaResultados = document.getElementById('pantalla-resultados');
        pantallaResultados.innerHTML = 'Consultando base de instituciones...';

        try {
            const response = await fetch(URL, {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor: " + response.status);
            }

            const jsonData = await response.json();
            pantallaResultados.innerHTML = ''; 

            if (jsonData.length > 0) {
                jsonData.forEach(item => {
                    // Adaptamos la impresión a las variables de la base de la clase (nombre, tipo, delmun, entidad)
                    let contenido_html = `
                        <strong>Nombre:</strong> ${item.nombre}<br/>
                        <strong>Tipo:</strong> ${item.tipo}<br/>
                        <strong>Municipio:</strong> ${item.delmun}<br/>
                        <strong>Entidad:</strong> ${item.entidad}<br/>
                        <strong>Sector:</strong> ${item.sector}<br/>
                        <hr style="border: 0.5px solid #3A4A5E; margin: 10px 0;"/>
                    `;
                    pantallaResultados.innerHTML += contenido_html;
                });
            } else {
                pantallaResultados.innerHTML = "La consulta no tiene resultados.<br/>";
            }

        } catch (error) {
            pantallaResultados.innerHTML = '<span style="color: #A35139;">Error: ' + error.message + '</span>';
        }
    });
});

// ============================================
// INCISO: F Mètodos GET y POST con validacion
// ============================================

// Funciòn de Validaciòn (No envìa si hay vacios)
function validarCampos() {
    const palabra= document.getElementById("palabra_clave").value.trim();
    const entidad= document.getElementById("entidad_fed").value;

    if(palabra === ""|| entidad === ""){
        alert("Error: Debes escribir una palabra y seleccionar una entidad antes de consultar.");
        return false; //Bloque el envìo
    }
    if (palabra.length < 3) {
        alert("Error: Debes escribir una palabra y seleccionar una entidad antes de consultar.");
        return false;
    }
    return {palabra, entidad};
}

// Evento : Consulta con GET
const btnGet= document.getElementById("btn-get");
if (btnGet){
    btnGet.addEventListener("click", async () => {
        const datos= validarCampos();
        if(!datos) return; // Se detiene si faltan datos

        const pantallaResultados= document.getElementById('pantalla-resultados');
        pantallaResultados.innerHTML= 'Consultando via GET ...';

        // Construir la URL con los paràmetros visibles
        const URL= `consulta_get_pdo.php?palabra=${encodeURIComponent(datos.palabra)}&entidad=${encodeURIComponent(datos.entidad)}`;

        try{
            const response = await fetch(URL, {method: 'GET', cache: 'no-cache'});
            if (!response.ok) throw new Error("Error en servidor: " + response.status);
            imprimirResultadosF(await response.json());
        }catch (error) {
            pantallaResultados.innerHTML= `<span style="color: #A35139;">Error: ${error.message}</span>`;
        }
    });
}

// Evento 2: Consulta por POST
const btnPost= document.getElementById("btn-post");
if (btnPost) {
    btnPost.addEventListener("click", async() => {
        const datos= validarCampos();
        if (!datos) return; // Se detiene si faltan datos

        const pantallaResultados= document.getElementById('pantalla-resultados');
        pantallaResultados.innerHTML= 'Consultando via POST ...';

        // Empaquetar los datos ocultos para el body
        let dataParams= new URLSearchParams();
        dataParams.append('palabra', datos.palabra);
        dataParams.append('entidad', datos.entidad);

        try{
            const response= await fetch('consulta_post_pdo.php', {
                method: 'POST',
                body: dataParams,
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            });
            if (!response.ok) throw new Error("Error en servidor: " + response.status);
            imprimirResultadosF(await response.json());
        } catch (error) {
            pantallaResultados.innerHTML= `<span style= "color: #A35139;">Error: ${error.message}</span>`;
        }
    });
}

// Funciòn auxiliar para imprimir los resultados del Inciso F
function imprimirResultadosF(jsonData) {
    const pantallaResultados= document.getElementById('pantalla-resultados');
    pantallaResultados.innerHTML= '';
    if (jsonData.length > 0) {
        jsonData.forEach(item => {
            let contenido_html = `
            <strong>Nombre:</strong> ${item.nombre}</br>
            <strong>Tipo:</strong>${item.tipo}</br>
            <strong>Municipio:</strong>${item.delmun}</br>
            <strong>Entidad:</strong>${item.entidad}</br>
            <hr style="border: 0.5px solid ·3A4A5E; margin: 10px 0;"/>
            `;
            pantallaResultados.innerHTML += contenido_html;
        });
    }else {
        pantallaResultados.innerHTML= "La consulta avanzada no arrojò resultados. </br>";
    }
}