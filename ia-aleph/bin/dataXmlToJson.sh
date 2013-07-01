#!/bin/bash

srcDir=src/main/webapp/data/
targetDir=src/main/javascript/data/

xsltproc ${srcDir}/weaponsToJson.xsl ${srcDir}/weapons.xml > ${targetDir}/ia-data_25_weapons_data.json
xsltproc ${srcDir}/unitsToJson.xsl ${srcDir}/units.xml > ${targetDir}/ia-data_35_units_data.json
xsltproc ${srcDir}/sectorialsToJson.xsl ${srcDir}/sectorials.xml > ${targetDir}/ia-data_45_sectorials_data.json
xsltproc ${srcDir}/wikiToJson.xsl ${srcDir}/wiki.xml > ${targetDir}/ia-data_55_wiki_data.json

bin/fix_json_data.sh

t=`mktemp`
for file in ${targetDir}/*.json; do
	jshon < $file > $t && cat $t > $file
	json_verify < $file
done

#json_verify < ${targetDir}/ia-data_25_weapons_data.json
#json_verify < ${targetDir}/ia-data_35_units_data.json
#json_verify < ${targetDir}/ia-data_45_sectorials_data.json

