<?php
include ('../../config.php');
header ("Access-Control-Allow-Origin: *\n");
header ("Access-Control-Allow-Headers: X-Requested-With, Content-Type\n");
$debug = 0;

if ($_POST || $debug) {
	if ($debug)
        $raw_data = '{"id_utilisateur":"123457","x":"1,123456","y":"1,123456","reponse":"1","idsol":"ABC123","nom_officiel":"bla","nom_referentiel":"bla","calcaire":"bla","pierrosite":"bla","texture":"bla","hydromorphie":"bla"}';
	else
        $raw_data = file_get_contents('php://input');
    if ($db) {
        $data = json_decode($raw_data, true);
        $conn = new mysqli ($server, $user, $pass, $db); 
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        $id_utilisateur = $data["id_utilisateur"];
        $x = $data["x"];
        $y = $data["y"];
        $reponse = $data["reponse"];
        $idsol = $data["idsol"];
        $nom_officiel = $data["nom_officiel"];
        $nom_referentiel = $data["nom_referentiel"];
        $calcaire = $data["calcaire"];
        $pierrosite = $data["pierrosite"];
        $texture= $data["texture"];
        $hydromorphie= $data["hydromorphie"];

        $request = "INSERT INTO reponses (id_utilisateur, x, y, reponse, idsol, nom_officiel,nom_referentiel,calcaire,pierrosite,texture,hydromorphie) VALUES ('$id_utilisateur', '$x', '$y', '$reponse', '$idsol', '$nom_officiel', '$nom_referentiel','$calcaire','$pierrosite','$texture','$hydromorphie')";
        if ($conn->query($request)) {
            if ($debug)    echo "New record created successfully|";
        } else {
            if($debug)    echo "Error: " . $sql . "|" . $conn->error;
        }
        if ($debug)
            $conn->close();
    }
    $options = array(
        'http' => array(
            'method' => 'POST',
            'header' => 'Content-Type: application/json' . "\r\n"
            . 'Content-Length: ' . strlen($raw_data) . "\r\n",
            'content' => $raw_data,
        )
	);
    
	$response = file_get_contents('https://plateforme.api-agro.fr/api/push/1.0/' . $api_dataset . '/realtime/push/?pushkey=' . $api_pushkey . '&apikey=' . $api_key, false, stream_context_create($options));
    print($response);
} else {
    print("{'message': 'Can create observation in POST only'}");
}
?>
