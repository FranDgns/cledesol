Cledesol = {// objet javascript : on definit des attributs ou des valeures (sous-ensemble) jquery = biblioteque generique pour manipuler du java dans des navigateurs differents
    
    radius: 50000,
    
    // Initialise la carte, le marqueur, et le fond de carte
    init: function () {
	var geoloc = {
	    lat: 45.86,
	    lng: 2.33
	};
	
	Cledesol.map = L.map('place')
	    .on('click', function (event) {
		var point = event.latlng;
		Cledesol.center(point.lat, point.lng);
	    });

	Cledesol.marker = L.marker(geoloc, {
	    draggable: true  
	})
	    .on("move", function (event) {
		point = this.getLatLng();
		Cledesol.drawObservationZone();
	    })
	    .on("dragstart", function (event) {
		Cledesol.radius = 0;
		Cledesol.drawObservationZone();
	    })
	    .on("dragend", function (event) {
		point = this.getLatLng();
		Cledesol.estimateObservationCount(point.lat, point.lng);
	    })
	    .addTo(Cledesol.map);

	L.easyButton('glyphicon glyphicon-screenshot', function(btn, map){
	    var point = Cledesol.marker.getLatLng();
	    Cledesol.map.setView(point, 9);
	}).addTo(Cledesol.map);
	
	Cledesol.observationZone = L.circle(geoloc, Cledesol.radius, {
	    weight: 2
	})
	    .addTo(Cledesol.map);

	$('#soil-validation-fix').on('click', function () {
	    $('#soil-validation').modal('hide');
	    $('#soil-fix').modal()
	});
	
	$('#soil-validation-accept').on('click', function () {
	    // Sync validation
	    $('#soil-validation').modal('close');
	});
	
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(Cledesol.map);

	Cledesol.center(geoloc.lat, geoloc.lng);
	if ("geolocation" in navigator) {
	    navigator.geolocation.getCurrentPosition(function(position) {
		Cledesol.center(position.coords.latitude, position.coords.longitude);
	    });
	} else {
	    console.log("Le service de géolocalisation n'est pas disponible sur votre ordinateur.");
	}

	Cledesol.drawAllObservations();
	
	$('#evaluate-button').on('click', Cledesol.showDonutValidation);
    },

    // Centre la carte aux coordonnées données
    center: function(lat, lng) {
	var point = [lat, lng];
	Cledesol.map.setView(point, 9);
	Cledesol.marker.setLatLng(point);
	Cledesol.estimateObservationCount(lat, lng);
    },

    drawObservationZone: function () {
	var point = Cledesol.marker.getLatLng();
	Cledesol.observationZone.setLatLng([point.lat, point.lng]).setRadius(Cledesol.radius);
    },

    serializeAndPush: function () {
	console.log('fff');
	var array = $("#newInput").serializeArray();
	var json = {};
	
	jQuery.each(array, function() {
	    json[this.name] = this.value || '';
	});
	console.log(json);
	Cledesol.pushFormData(json);
    },

    pushFormData: function(rawdata)
    {
	console.log("helloooow");
	$.ajax({
	    type: 'POST',
	    url: "http://217.174.196.5/cleserver.php",
	    data: JSON.stringify(rawdata),
	    dataType: "application/json",
	    headers: {
		"Access-Control-Allow-Headers": "X-Requested-With",
		"X-Requested-With": "XMLHttpRequest"
            },
	    success: function (msg) {
		if (msg) {
		    console.log('push réussi' + describe(msg));
		    Cledesol.drawAllObservations();
		    $("#soil-fix").modal("hide");
		}
		else {
		    console.log('push échoué');}
	    }
	});
    },

    drawAllObservations: function () {
	$.ajax("http://217.174.196.5/cledisplay.php", {
	    success: function(data,status,request) {
		var json = JSON.parse(data);
		console.log(json);
		json.forEach(function(element) {
		    mymarker = L.circleMarker({
			lat: element.x,
			lng: element.y
		    }, {
			color: "#502d16",
			weight: 2,
			fillColor: "#c87137",
			fillOpacity: 0.7,
			title: element.id_utilisateur
		    });
		    mymarker
		     .bindPopup(element.id_utilisateur + "<br>" + element.reponse + "<br>" + element.idsol + "<br>" + element.nom_officiel + "<br>" + element.nom_referentiel + "<br>" + element.calcaire + "<br>" + element.pierrosite + "<br>" + element.texture + "<br>" + element.hydromorphie)
			.addTo(Cledesol.map);
		});
	    }
	});
    },
    
    // Calcule le nombre d'observation dans un rayon donné
    estimateObservationCount: function (lat, lng, radius) {
	var point = [lat, lng];
	var increment = 5;
	var button = $('#evaluate-button');
	$("input[name='x']").val(lat);
	$("input[name='y']").val(lng);
	if (radius === undefined || radius === null) {
	    radius = increment;
	    button.attr("disabled", "disabled");
	    button.html("En recherche d'observations...");
	}
	Cledesol.radius = radius * 1000;
	Cledesol.drawObservationZone();
	$.ajax("https://plateforme.api-agro.fr/api/records/1.0/search/?dataset=parcelles-vigicultures-sols&q=not+%23null(type_sol)&geofilter.distance=" + lat + "," + lng + "," + Cledesol.radius + "&fields=type_sol&apikey=7c7295c3ffbfce70ec53daa132c3a2825e3aa8ca439f27b33e342d20", {
	    success: function (data, status, request) {
		if (data.nhits > 0) {
		    button.removeAttr("disabled");
		    button.attr('data-soil-radius', radius); 
		    button.html("<span class='glyphicon glyphicon-ok'></span> Évaluer (" + data.nhits + " dans un rayon de " + radius + "km)")
		} else {
		    button.attr("disabled", "disabled");
		    button.html("Aucune observation dans un rayon de " + radius + "km");
		    if (radius < 50)
			Cledesol.estimateObservationCount(lat, lng, radius + increment);
		}
	    }
	});
    },

    

    chart: null,
    
    showDonutValidation: function (tableauCount, tableauLabel) {
	// Calcule la pourcentage de type de sol par rapport aux resultats du rayon
	// series1 = data
	point = Cledesol.marker.getLatLng();
	$.ajax("https://plateforme.api-agro.fr/api/records/1.0/analyze/?dataset=parcelles-vigicultures-sols&q=not+%23null(type_sol)&geofilter.distance=" + point.lat + "," + point.lng + "," + Cledesol.radius + "&fields=type_sol&apikey=7c7295c3ffbfce70ec53daa132c3a2825e3aa8ca439f27b33e342d20" + "&x=nom_sol&y.count.func=COUNT", { // remplacer type_sol avec "Nom officiel"
	    success: function (data, status, request) {
		console.log(data);
		var tableauCount = data.map(function(obj){ 
		    return obj.count; 
		});
		console.log(tableauCount);
		var tableauLabel = data.map(function(obj){ 
		    return obj.x; 
		});
		console.log(tableauLabel);

		if (Cledesol.chart !== null) {
		    Cledesol.chart.destroy();
		}
		    
		
		Cledesol.chart = new Chart("soil-observations", {
		    type: 'doughnut',
		    options: {
			onClick: function (event, activeItems) {
			    var item = activeItems[0];
			    var legend = this.data.labels[item._index];
			    if (confirm("Est-ce que votre observation correspond bien à : " + legend + " ?")) {
				$("#soil-validation").modal('hide');
			    }
			}
		    },
		    data: {
			datasets: [{
			    data: tableauCount,
			    //backgroundColor: ["#00de00", "#6f006f", "#4ade94", "#004ab9", "#de6f4a", "#b9b925", "#00b994", "#25946f", "#de00b9", "#94006f", "#de6f94", "#252594", "#dede94", "#4a2594", "#940000", "#deb9de", "#00b9b9", "#00de94", "#25254a", "#6fde6f", "#4a0094", "#256f4a", "#6f4a25", "#4a4a00", "#b9006f", "#4a6f25", "#6f946f", "#009425", "#6f4ade", "#2525de", "#b9946f", "#b9b994", "#b9de94", "#de256f", "#b900b9", "#4a4a6f", "#4a2525", "#006fde", "#940025", "#250094", "#b900de", "#4ab9b9", "#00004a", "#6f6fde", "#256fde", "#b92594", "#6f944a", "#6f6f25", "#4ab9de", "#de2525", "#2525b9", "#944a94", "#b94a94", "#946f94", "#b94a6f", "#000094", "#4a6f6f", "#006f00", "#946f4a", "#00256f", "#6f4a6f", "#de6fb9", "#6fdeb9", "#de6f00", "#94b94a", "#94b994", "#6f6fb9", "#b925de", "#de2594", "#dede25", "#6f4a94", "#946f6f", "#de25de", "#b92525", "#6fde94", "#254a25", "#4adeb9", "#00deb9", "#b9b9b9", "#6f4a4a", "#256f25", "#25deb9", "#6f25de", "#94b925", "#b9254a", "#4ade25", "#4a006f", "#25006f", "#94de00", "#6fb925", "#259425", "#6f9425", "#944a00", "#25b9b9", "#25de4a", "#00254a", "#94254a", "#4a6f94", "#002500", "#6fdede", "#deb925", "#b9b9de", "#4a4a94", "#004a4a", "#25b994", "#6f6f00", "#b92500", "#b925b9", "#940094", "#2594de", "#4ade4a", "#949400", "#256f6f", "#de00de", "#6fde25", "#4a6fde", "#4a4ab9", "#deb96f", "#6f0025", "#00b925", "#0000b9", "#254a94", "#4a25b9", "#b9004a", "#b9de00", "#6f254a", "#6f2500", "#94b96f", "#25de00", "#b99425", "#b90025", "#0094b9", "#4ab925", "#4ab96f", "#6fde00", "#b9b96f", "#94b9b9", "#de4a6f", "#4a2500", "#de0000", "#4a4a4a", "#259494", "#9400b9", "#b9deb9", "#254a00", "#0000de", "#dede4a", "#94dede", "#94de25", "#4a9494", "#4a94de", "#6fb9b9", "#dede00", "#b9256f", "#de9494", "#009494", "#006f4a", "#94944a", "#4ab900", "#6f6f4a", "#b99494", "#6f004a", "#4a256f", "#00b9de", "#b99400", "#00b96f", "#deb9b9", "#4a6f00", "#000025", "#00006f", "#00de4a", "#b96f94", "#6fb9de", "#946fde", "#deb900", "#004ade", "#254ab9", "#25de6f", "#94deb9", "#b994de", "#004a25", "#94256f", "#250025", "#6f6f6f", "#4a944a", "#4a25de", "#00b94a", "#4a4a25", "#9400de", "#94004a", "#4a94b9", "#94de94", "#6f256f", "#6fb900", "#b9944a", "#de94de", "#944a25", "#6f2594"],
			    backgroundColor: ["#543005", "#8C510A", "#BF812D", "#DFC27D", "#F6E8C3", "#F5F5F5", "#C7EAE5", "#80CDC1", "#35978F", "#01665E", "#003C30"],
			    label: 'Types de sol' // for legend
			}],
			labels: tableauLabel		
		    }
		});
		
		$('#soil-validation').modal();			
	    }
	});
    }
    

}


$(document).ready(Cledesol.init);
