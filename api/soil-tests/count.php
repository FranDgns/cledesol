<?php
include ("../../config.php");
header ("Access-Control-Allow-Origin: *\n");
header ("Access-Control-Allow-Headers: X-Requested-With, Content-Type\n");

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$radius = $_GET['radius'];

$response = file_get_contents('https://plateforme.api-agro.fr/api/records/1.0/search/?dataset=parcelles-vigicultures-sols&q=not+%23null(type_sol)&geofilter.distance=' . $lat . ',' . $lng . ',' . $radius . '&fields=type_sol&apikey=' . $api_key, null, stream_context_create(array(
    'http' => array(
        'method' => 'GET',
        'header' => 'Content-Type: application/json'
    )))
);
print($response);
?>
