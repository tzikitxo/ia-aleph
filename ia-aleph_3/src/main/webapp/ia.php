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
//
//if (!function_exists('gzdecode')) {
//
//    function gzdecode($data) {
//        return gzinflate(substr($data, 10, -8));
//    }
//
//}
//
//$storage_dir = "storage";

$response = "{ \"success\" : false }";

if ($_SERVER['REMOTE_ADDR'] == '127.0.0.1') {
    sleep(1); // emulate remote call on debug
}

if ($_REQUEST['action'] == 'checkService') {

    $response = json_encode(array('success' => true, 'currentTime' => date('c')));
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
}
//} else if ($_REQUEST['action'] == 'storeData') {
//    $deviceId = $_REQUEST['deviceId'];
//    $key = $_REQUEST['key'];
//    if (preg_match('/^[0-9a-zA-Z.]+$/', $deviceId) && preg_match('/^[a-zA-Z0-9.]+$/', $key)) {
//
//        $dir = $storage_dir . "/" . $deviceId . "/";
//        if (!file_exists($dir)) {
//            mkdir($dir, 0700, true);
//        }
//        $file = $dir . $key;
//        $data = isset($_REQUEST['b64data']) ? base64_decode($_REQUEST['b64data']) : $_REQUEST['data'];
//
//        $json = json_decode($data, true);
//
//        if ($json != NULL) {
//
//            $date = strtotime($json['dateMod']) || strtotime('@' . $json['dateMod']);
//            $now = time();
//
//            // note: php time() ( $now ) returns epoch in sec, js dateMod ( $date ) is in msec
//            if ($date == FALSE || $date <= 0 || $date / 1000 > $now + 10 * 60) { // if broken date, or more than 10 minutes in the future
//                $json['dateMod'] = date('U', $now) . '000';
//            }
//
//            $data = json_encode($json);
//
//            file_put_contents($file . '.gz', gzencode($data, 9));
//
//            $data = gzdecode(file_get_contents($file . '.gz'));
//
//            if ($data != FALSE) {
//                $response = json_encode(array('success' => true, 'data' => $data));
//            }
//        }
//    }
//} else if ($_REQUEST['action'] == 'getData') {
//    $deviceId = $_REQUEST['deviceId'];
//    $key = $_REQUEST['key'];
//    if (preg_match('/^[0-9a-zA-Z.]+$/', $deviceId) && preg_match('/^[a-zA-Z0-9.]+$/', $key)) {
//        $file = $storage_dir . "/" . $deviceId . "/" . $key . '.gz';
//        if (!file_exists($file)) {
//            $response = json_encode(array('success' => false, 'message' => 'no data found for this key'));
//        } else {
//            $data = gzdecode(file_get_contents($file));
//
//            if ($data != FALSE) {
//                $response = json_encode(array('success' => true, 'data' => $data));
//            }
//        }
//    }
//} else if ($_REQUEST['action'] == 'listData') {
//    $deviceId = $_REQUEST['deviceId'];
//    if (preg_match('/^[0-9a-zA-Z.]+$/', $deviceId)) {
//        $dir = $storage_dir . "/" . $deviceId . "/";
//        $res = array();
//        foreach (scandir($dir) as $file) {
//            if (is_file($dir . $file) == TRUE) {
//                $data = json_decode(gzdecode(file_get_contents($dir . $file)), true);
//                $key = basename($file, '.gz');
//                $res[$key] = array('key' => $key, 'dateMod' => $data['dateMod'], 'deleted' => isset($data['deleted']) ? $data['deleted'] : false);
//            }
//        }
//
//        $response = json_encode(array('success' => true, 'data' => $res));
//    }
//} else if ($_REQUEST['action'] == 'getDiskUsage') {
//    $storageSize = 0.0;
//    $storageFileCount = 0;
//    $storageDirCount = 0;
//    foreach (scandir($storage_dir) as $dir) {
//        if (is_dir($storage_dir . "/" . $dir)) {
//            $storageDirCount++;
//            foreach (scandir($storage_dir . "/" . $dir) as $file) {
//                $filename = $storage_dir . "/" . $dir . "/" . $file;
//                if (is_file($filename) == TRUE) {
//                    $storageFileCount++;
//                    $storageSize+=filesize($filename);
//                } 
//            }
//        }
//    }
//    $freeSpace = disk_free_space('./');
//    $response = json_encode(array('success' => true, 'data' => array(
//            'storageSizeBytes' => $storageSize,
//            'freeSpaceBytes' => $freeSpace,
//            'storageSizeMegs' => (int) ($storageSize / 1024 / 1024),
//            'freeSpaceMegs' => (int) ($freeSpace / 1024 / 1024),
//            'storageFileCount' => $storageFileCount,
//            'storageDirCount' => $storageDirCount
//    )));
 else if ($_REQUEST['action'] == 'printPdf') {
	$htmlData=$_REQUEST['html'];
//    $htmlData = file_get_contents("php://input");
	$process= proc_open("bin/wkhtmltopdf-amd64 - -",array(0 => array("pipe", "r"),1 => array("pipe", "w")),$pipes);
	#$process= proc_open("wkhtmltopdf - -",array(0 => array("pipe", "r"),1 => array("pipe", "w")),$pipes);
	fwrite($pipes[0],$htmlData);
	fclose($pipes[0]);
	$pdfData = stream_get_contents($pipes[1]);
	header('Content-Type: application/pdf');
	header('Content-Disposition: attachment; filename='."file.pdf");
	echo $pdfData;
	exit;
}

header('Content-type: application/json');
echo $response;
?>
