<?php

/*
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */

$storage_dir = "/tmp/storage";

$response = "{ \"success\" : false }";

if ($_REQUEST['action'] == 'checkService') {

	$response = "{ \"success\" : true }";
} else if ($_REQUEST['action'] == 'getTinyUrl') {

	require_once('gapikey.php'); // set $googleApiKey

	$target = 'https://www.googleapis.com/urlshortener/v1/url?key=' . $googleApiKey;

	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $target);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	$data = file_get_contents("php://input");

	curl_setopt($curl, CURLOPT_POST, count($data));
	curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	curl_setopt($curl, CURLOPT_HTTPHEADER, Array('Content-Type: application/json'));

	$response = curl_exec($curl);

	curl_close($curl);
} else if ($_REQUEST['action'] == 'storeData') {

	$dir = $storage_dir . "/" . $_REQUEST['deviceId'] . "/";
	mkdir($dir, 0700, true);
	$file = $dir . $_REQUEST['key'];
	file_put_contents($file, $_REQUEST['data']);

	$data = file_get_contents($file);

	if ($data != FALSE) {
		$response = json_encode(array('success' => true, 'data' => $data));
	}
} else if ($_REQUEST['action'] == 'getData') {

	$file = $storage_dir . "/" . $_REQUEST['deviceId'] . "/" . $_REQUEST['key'];
	$data = file_get_contents($file);

	if ($data != FALSE) {
		$response = json_encode(array('success' => true, 'data' => $data, 'lastMod' => date('c', filemtime($file))));
	}
} else if ($_REQUEST['action'] == 'listData') {

	$dir = $storage_dir . "/" . $_REQUEST['deviceId'] . "/";
	$list = array();
	foreach (scandir($dir) as $file) {
		if (is_file($dir . $file) == TRUE) {
			$list[] = $file;
		}
	}

	$response = json_encode(array('success' => true, 'data' => $list));
}

header('Content-type: application/json');
echo $response;
?>