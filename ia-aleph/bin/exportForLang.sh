#!/bin/bash

#jxpath='java -jar /home/aleph/svn/jxpath4json/target/jxpath4json-1.0-SNAPSHOT-jar-with-dependencies.jar'
jxpath='java -jar bin/xpath4json-1.0-SNAPSHOT-jar-with-dependencies.jar'

w=src/main/javascript/data/ia-data_25_weapons_data.json

#lang="$1"

#t=`mktemp`
t='/tmp/localization_resources.json'

u=`mktemp`
{
echo '['
for file in  src/main/javascript/data/ia-data_3[678]_*; do
        echo " including $file" >&2
                echo '['
                cat $file
                echo '],'
done
echo '[]]' 
} > $u


{
#	echo "messages['it']={"
	echo '{'	
	
	echo '"name":{'
	$jxpath '/name' $u | sed 's#$#:"TODO",#'
	echo '},'

#isc=`mktemp`
	echo '"isc":{'
	$jxpath '/isc' $u | sed 's#$#:"TODO",#'
	echo '},'

	echo '"codename":{'
	$jxpath 'childs/codename' $u | sort | uniq | sed 's#$#:"TODO",#'
	echo '},'

	echo '"spec":{'
	$jxpath 'spec' $u | sort | uniq | sed 's#$#:"TODO",#'
	echo '},'

	
	echo '"bsw":{'
	$jxpath ".[cc!='Yes']/name" $w | sort | sed 's#$#:"TODO",#'
	echo '},'


	echo '"ccw":{'
	$jxpath ".[cc='Yes']/name" $w | sort | sed 's#$#:"TODO",#'
	echo '},'

	echo '}'
} | tr -d '\n' | sed -e 's#,}#}#g' -e 's#,]#]#g' | jshon -S | tee $t

echo "exported lang to $t"

#t=`mktemp`
#{
#	cat $names 
#}

