Cledesol = {
    
    radius: 50000,
    
    // Initialise la carte, le marqueur, et le fond de carte
    init: function () {
	var geoloc = {
	    lat: 45.86,
	    lng: 2.33
	};
	
	Cledesol.map = L.map('place');

	Cledesol.marker = L.marker(geoloc, {
	    draggable: true  
	})
	    .on("move", function (event) {
		point = this.getLatLng();
		Cledesol.observationZone.setLatLng([point.lat, point.lng]);
	    })
	    .on("dragend", function (event) {
		point = this.getLatLng();
		Cledesol.estimateObservationCount(point.lat, point.lng);
	    })
	    .addTo(Cledesol.map);

	Cledesol.observationZone = L.circle(geoloc, Cledesol.radius).addTo(Cledesol.map);

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

	$('#evaluate-button').on('click', Cledesol.showDonutValidation);
    },

    // Centre la carte aux coordonnées données
    center: function(lat, lng) {
	var point = [lat, lng];
	Cledesol.map.setView(point, 9);
	Cledesol.marker.setLatLng(point);
	Cledesol.estimateObservationCount(lat, lng);
    },

    // Calcule le nombre d'observation dans un rayon donné
    estimateObservationCount: function (lat, lng, radius) {
	var point = [lat, lng];
	if (radius === undefined || radius === null) {
	    radius = Cledesol.radius;
	}
	$.ajax("https://plateforme.api-agro.fr/api/records/1.0/search/?dataset=parcelles-vigicultures-sols&geofilter.distance=" + lat + "," + lng + "," + radius + "&fields=type_sol&apikey=7c7295c3ffbfce70ec53daa132c3a2825e3aa8ca439f27b33e342d20", {
		success: function (data, status, request) {
			if (data.nhits > 0) {
			    $('#evaluate-button').html("Évaluer (" + data.nhits + ")")
		        console.log(data);
				// Calcule la pourcentage de type de sol par rapport aux resultats du rayon
				// series1 = data
				$.ajax("https://plateforme.api-agro.fr/api/records/1.0/analyze/?dataset=parcelles-vigicultures-sols&geofilter.distance=" + lat + "," + lng + "," + radius + "&fields=type_sol&apikey=7c7295c3ffbfce70ec53daa132c3a2825e3aa8ca439f27b33e342d20" + "&x=type_sol&y.serie.func=COUNT", {
					success: function (data, status, request) {
						console.log(data);
						console.log(alert(data.serie));
						// var result.sum = math.sum(data_test);
						// console.log(result);
					// data_test = [1,4,6,3,5,393,4,5];
					// int result = math.sum(data_test);
					// System.out.println(result);
					// function total(a,b)
					// {
					// result=a+b;
					// return result
					// }
					}
				});
			} else {
			    $('#evaluate-button').html("Évaluer (aucune observation)");
			}
		}	
		// console.log(data);
	});
    },

    showDonutValidation: function (lat, lng, radius) {
	var myDoughnutChart = new Chart("soil-observations", {
	    type: 'doughnut',
	    data: {
		datasets: [{
		    data: [45, 25, 20, 10]
		}],
		labels: ['Red', 'Blue', 'Purple', 'Yellow']
	    }
	});
	
	$('#soil-validation').modal();	
    }
	

}

$(document).ready(Cledesol.init);
