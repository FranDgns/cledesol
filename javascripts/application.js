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
      $('#soil-fix').modal();
    });
    
    $('#soil-validation-accept').on('click', function () {
      // Sync validation
      $('#soil-validation').modal('close');
    });

    $('#new-observation').on('submit', function (event) {
      event.preventDefault();
      $('#soil-fix').modal('hide');
      Cledesol.serializeAndPush.call(this);
      return false;
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

  serializeAndPush: function (url) {
    var url = $(this).attr('action')
    var array = $(this).serializeArray();
    var observation = {};
    
    jQuery.each(array, function() {
      observation[this.name] = this.value || '';
    });
    
    console.log(observation);
    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(observation),
      dataType: 'json',
      headers: {
        "Access-Control-Allow-Headers": "X-Requested-With",
        "X-Requested-With": "XMLHttpRequest"
      },
      success: function (data, status, request) {
        console.log(data);
        if (data !== null && data.status !== null && data.status === 'ok') {
          console.log('Push réussi');
          Cledesol.drawAllObservations();
          $("#soil-fix").modal("hide");
        } else {
          console.log('Push échoué');
        }
      },
      error: function (request, status, error) {
        console.log(status);
        console.log(error);
      }
    });
  },

  drawAllObservations: function () {
    $.ajax('/api/observations/index.php', {
      success: function(data, status, request) {
        var json = JSON.parse(data);
        console.log(json);
        json.records.forEach(function(record) {
          var element = record.fields;
          var marker = L.circleMarker({
            lat: element.x,
            lng: element.y,
          }, {
            radius: 4,
            color: "#502d16",
            weight: 1,
            fillColor: "#c87137",
            fillOpacity: 0.7,
            title: element.id_utilisateur
          });
          marker
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
    $.ajax('/api/soil-tests/count.php', {
      data: {
        lat: lat,
        lng: lng,
        radius: Cledesol.radius
      },
      dataType: 'json',
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
    $.ajax('/api/soil-tests/stats.php', { // remplacer type_sol avec "Nom officiel"
      data: {
        lat: point.lat,
        lng: point.lng,
        radius: Cledesol.radius
      },
      dataType: 'json',      
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
