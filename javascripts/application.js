Cledesol = {
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
	    .on("dragend", function (event) {
		point = this.getLatLng();
		console.log(point);
		Cledesol.estimateObservationCount(point.lat, point.lng);
	    })
	    .addTo(Cledesol.map);
	
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
    },

    // Centre la carte aux coordonnées données
    center: function(lat, lng) {
	var point = [lat, lng];
	Cledesol.map.setView(point, 16);
	Cledesol.marker.setLatLng(point);
	Cledesol.estimateObservationCount(lat, lng);
    },

    // Calcule le nombre d'observation dans un rayon donné
    estimateObservationCount: function (lat, lng, radius) {
	var point = [lat, lng];
	if (radius === undefined || radius === null)
	    radius = 50000;
	$.ajax("https://plateforme.api-agro.fr/api/records/1.0/search/?dataset=parcelles-vigicultures-sols&geofilter.distance=" + lat + "," + lng + "," + radius + "&fields=type_sol&apikey=7c7295c3ffbfce70ec53daa132c3a2825e3aa8ca439f27b33e342d20", {
	    success: function (data, status, request) {
		if (data.nhits > 0) {
		    console.log("Yes");
		}
	    }
	});
    }
}

$(document).ready(Cledesol.init);
