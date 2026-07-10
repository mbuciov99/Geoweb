	var map = L.map('map').setView([19.29075, -99.22141], 5); // ajustar coordenadas y nivel de zoom

	var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors'
	}).addTo(map);

	function popUpInfo(features,layer) {
		if(features.properties && features.properties.nombre) {
			//layer.bindPopup("<b>"+features.properties.nombre+"</b><br/>"+features.properties.delmun+"</b><br/>"+features.properties.tamanio);
			layer.bindTooltip("<b>"+features.properties.nombre+"</b><br/>"+features.properties.delmun+"</b><br/>"+features.properties.tamanio);

		}
	}

	var redIcon = L.icon({iconUrl: 'imagenes/rojo.jpeg', iconSize: [50,50]});
	var yellowIcon = L.icon({iconUrl: 'imagenes/amarillo.jpeg', iconSize: [40,40]});
	var blueIcon = L.icon({iconUrl: 'imagenes/azul.jpeg', iconSize: [30,30]});
	var purpleIcon = L.icon({iconUrl: 'imagenes/morado.jpeg', iconSize: [20,20]});
	var greenIcon = L.icon({iconUrl: 'imagenes/verde.jpeg', iconSize: [15,15]});

	var miconsulta = L.geoJson(null, {
		pointToLayer: function(features,latlng) {
			var tamanio = features.properties.tamanio;
			if(tamanio =="GRANDE") {
				return L.marker(latlng,{icon: redIcon});
			} else if(tamanio=="MEDIANA") {
				return L.marker(latlng,{icon: yellowIcon});
			} else if(tamanio=="MICRO") {
				return L.marker(latlng,{icon: purpleIcon});
			} else if(tamanio=="NINGUNA") {
				return L.marker(latlng,{icon: greenIcon});
			} else if(tamanio=="PEQUEÑA") {
				return L.marker(latlng,{icon: blueIcon});
			} else {
				return L.circleMarker(latlng, {color:'#000000',weight:3,radius:12});
			}
		},
		onEachFeature: popUpInfo
	});

////////////////////////////////////////////////////
var marcas= L.markerClusterGroup();
	
$(document).ready(function(){
    $('#envio_get').submit(function() {
        var URL = 'php/listaInst_geojson.php';
        var contenido_html = "";
        var ajax_get = $.ajax({
	        type : "GET",
            url : URL,
            dataType : 'json',
		    data : {
				tipo : $('#tipo option:selected').html()
		    } ,
	        contentType: 'application/json',
	        timeout:10000,
        success : function (response) {
			miconsulta.clearLayers();
			marcas.clearLayers();
			$('#contenido').html('');
		  if(response.features.length > 0) {
			miconsulta.addData(response);
			marcas.addLayer(miconsulta);
			//Recorre los resultados obtenidos
			for(var i = 0; i < response.features.length; i++) {
			   contenido_html = "Nombre " + response.features[i].properties.nombre + "<br/>";
			   contenido_html += "Tipo: " + response.features[i].properties.tipo + "<br/>";
			   contenido_html += "Municipio: " + response.features[i].properties.delmun + "<br/>";
			   contenido_html += "Entidad: " + response.features[i].properties.entidad + "<br/>";
			   contenido_html += "Sector: " + response.features[i].properties.sector + "<br/>";
			   contenido_html += "Rama: " + response.features[i].properties.rama + "<br/>";
			   contenido_html += "Clase: " + response.features[i].properties.clase + "<br/>";
			   contenido_html += "<hr/>";
			   $('#contenido').append(contenido_html);
			} //fin del for
		  } else {
			contenido_html = "La consulta no tiene resultados";
			$('#contenido').append(contenido_html);
		  } // fin del if
			
		},
		error : function(jqXHR, estado, error) {
			$('#contenido').html('Se produjo un error:' + estado + ' error: ' + error);
		}
        });
		miconsulta.addTo(map);
		map.addLayer(marcas);
		//previene el re-envío del requerimiento
		return false;
	});
});

	
