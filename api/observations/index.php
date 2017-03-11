<?php
include ("../../config.php");
header ("Access-Control-Allow-Origin: *\n");
header ("Access-Control-Allow-Headers: X-Requested-With, Content-Type\n");
/*
$debug = 0;
$result = array();
$conn = new mysqli ($server, $user, $pass, $db); 
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$request = "SELECT * from reponses";
if ($sql_result=$conn->query($request)) {
	if ($debug)    echo "New record created successfully<br>";
} else {
	if($debug)    echo "Error: " . $sql . "<br>" . $conn->error;
}
while ($row = $sql_result->fetch_assoc()) $result[]=$row;
if ($debug)$conn->close();
print(json_encode($result));
*/

$response = file_get_contents('https://plateforme.api-agro.fr/api/records/1.0/search/?dataset=' . $api_dataset . '&apikey=' . $api_key, null, stream_context_create(array(
    'http' => array(
        'method' => 'GET',
        'header' => 'Content-Type: application/json'
    )))
);
print($response);
?>
