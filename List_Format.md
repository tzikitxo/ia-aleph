# List Format #

This page describe the structure of the list format. This format is used in:
  * list export/import link and qrcode
  * list saving (localStorage)
  * list synchronization / remote saving

# Envelope #

A list is made from 'data' part, which is encoded, and packaged in an 'envelope' url. The 'data' part is a JSON object, described later.

data = {...}

the 'data' is:
  * serialised as a json string
  * encoded with base64 (with a small url-safe patch)
  * incorporated in a url
```
json = JSON.stringify(data)

b64 = encodeBase64(json).replace('\','backslash').replace('+','plusSign').replace('=','equalsSign')

url= 'http://anyplace.it/ia/ia.html?list=' + b64
```

the final url can be shared:
  * as is, on a forum, via email, etc
  * as qrcode
  * minified with goo.gl or other tynyurl services

# Usage #

Loading the url in a browser should open the correct tool, and load the contained list:
  * on most browser, it'll open the webapp (which is in fact located at http://anyplace.it/ia/ia.html)
  * on android, the Android app should intercept the url, and open the list in the android app
  * on ios, the web app will redirect the url http://anyplace.it/ia/ia.html?list=.. to alephtoolbox:...; the ios app should then intercept the schema 'alephtoolbox:' and load the list

# Data Format #

the json data format is:
```
{
        'pcap':armyList.pointCap,
        'faction':factionName,
        'sectorial':sectorialName,
        'includeMercs':booleanIncludeMercs,
        'models':modelList,
        'listId':listId,
        'listName':listName,
        'dateMod': String((new Date()).getTime()),
        'groupMarks':groupMarks,
        'combatGroupSize':combatGroupSize,
        'specop':specop,
        'mercenaryFactions':factionName=='Mercenary Company' ?mercenaryFactions:null
    }
```

  * pcap: point cap of the list (es: 300)
  * faction: faction name (es: 'Aleph')
  * sectorial: sectorial name, or null/undefined if none (es :'Shasvastii  ...')
  * includeMercs: true if the list can include mercenary units, false/null/undefined otherwise
  * models: list of models, like
```
[{ 'isc':model.isc, 'code':model.code, 'recordid':listRecord.id },...]
```
where
    * models.isc: the model isc;
    * models.code: the model code;
    * models.recordid: an unique id for the model (like "1234532145");

  * listId: a (string) unique id for the list (somethink like '23453245163')
  * listName: a name/description for the list
  * dateMod: timestamp of last modified, in millisecs
  * groupMarks: position of group separator markers, es: [0,9] (first marker at the head of the list, second marker after the 9th model); the first marker is always at position 0;
  * combatGroupSize: size of a combat group (defaults to 10)
  * specop: specop data, if the list contains a specop. otherwise, null/undefined;
  * mercenaryFactions: for mercenary armies, a list of the factions used. Otherwise, null/undefined;