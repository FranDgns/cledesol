//var testbed = {"id_utilisateur" : "123457","x" : "1,123456","y" :
//"1,123456","reponse" : "1","idsol" : "ABC123","reponse_formulaire" :
//"une chaine de blabla"};

//function values2json(form_output) {
//	var formData = JSON.stringify($("#myForm").serializeArray());
//}

//$(document).ready(function() {
//    pushFormData(testbed);
//});

function pushFormData(rawdata)
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
            console.log('push réussi' + describe(msg));}
        else {
            console.log('push échoué');}
     }
    });
}
