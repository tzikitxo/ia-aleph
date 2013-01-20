<?php

if ($_REQUEST['action'] == 'checkService') {
    
    header('Content-type: application/json');
    echo "{ \"success\" : true }";
    
}else if ($_REQUEST['action'] == 'getTinyUrl') {
    
    require_once('gapikey.php'); // set $googleApiKey

    $target = 'https://www.googleapis.com/urlshortener/v1/url?key='.$googleApiKey;

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $target);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $data = file_get_contents("php://input");

    curl_setopt($curl, CURLOPT_POST, count($data));
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPHEADER, Array('Content-Type: application/json'));

    $response = curl_exec($curl);

    curl_close($curl);

    header('Content-type: application/json');
    echo $response;
}

?>