<?php
include ("db.php");
header ("Access-Control-Allow-Origin: *\n");
header ("Access-Control-Allow-Headers: X-Requested-With, Content-Type\n");
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
?>
