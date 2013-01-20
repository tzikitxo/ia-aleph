<?php


for ($i = 1; $i < $argc; $i++) {

    $file = $argv[$i];
    echo "processing file $file\n";

    $doc = new DOMDocument();
    $doc->loadHTMLFile($file);

    $xpath = new DOMXpath($doc);
//foreach($xpath->query("//div") as $node) {
//    
//}#banner , #title , .tabArea
//$pattern="//div[@id='mydiv']";

    $toDeleteList = array("//*[@id='banner']", "//*[@id='title']", "//*[@class='tabArea']", "//script", "//*[@id='footer']", "//*[@class='wikiGlobalFooter']");

    foreach ($toDeleteList as $toDelete) {
        $nodeList = $xpath->query($toDelete);
        foreach ($nodeList as $node) {
            $node->parentNode->removeChild($node);
        }
    }

    foreach ($xpath->query("//*[@onload]") as $toRemoveAttr){
		$toRemoveAttr->removeAttribute("onload");
	}


//	$nodeList=$xpath->query("//*[@id='content']");
//	$node=$nodeList->item(0);
	$node=$xpath->query("//*[@id='content']")->item(0);
	$node->C14NFile($file);

//    $doc->saveHTMLFile($file);
}

//include 'simple_html_dom.php';
//
//
//$html = new simple_html_dom();  
//  
//$html->load_file($file);
//        
//// Load from a string  
////$html->load('<html><body><div id="mydiv">aaa</div></html>'); 
// 
//// Load a file 
////$html->load_file('http://net.tutsplus.com/');  
//
////$html->save('result.htm');
//
////echo $html->save();
//$html->save($file);
?>
