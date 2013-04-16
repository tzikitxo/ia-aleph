#!/bin/bash

first=`mktemp`
#echo '<wiki>' > src/main/webapp/data/wiki.xml
data=src/main/javascript/data/ia-data_55_wiki_data.json
echo '[' > $data

{
	#echo "en http://infinitythegame.wikispot.org/ http://infinitythegame.wikispot.org/Index"
	echo "en http://infinitythegame.wikispot.org/"
	echo "de http://infinity-tabletop.wikispot.org/"
	echo "fr http://infinitylejeu.wikispot.org/"
	echo "es http://infinity.wikispot.org/"
	echo "ca http://infinity.wikispot.org/"
} | while read lang baseUrl; do

	echo "processing $lang $baseUrl"

    plist=`mktemp`

	[ -e $first ] && rm $first || echo ',' >> $data

    [ -e "src/main/webapp/wiki_${lang}" ] || mkdir "src/main/webapp/wiki_${lang}"
    
    bin/download_wiki.sh "$baseUrl" "src/main/webapp/wiki_${lang}" $plist || break 

    bin/process_wiki.sh "src/main/webapp/wiki_${lang}" $plist "`pwd`/${data}" "$lang" "$baseUrl" || break

	echo "done $lang $baseUrl"
#	echo ',' >> $data

done

{
#echo -e "\t\"date\":\"$(echo 'print((new Date()).toString());' | js)\"" 
#echo '(new Date()).toString()' | js
echo ']' 

} >> $data

t=`mktemp`
jshon -S < $data > $t || exit 1
cat $t > $data && rm $t

#du -shc src/main/webapp/wiki_*
#echo "compressing images"
#find src/main/webapp/wiki_* -iname '*.png' | while read file; do
#	convert -verbose "$file" "$(echo "$file" | sed 's#...$#jpg#')"
#	rm "$file"
#done
#find src/main/webapp/wiki_* -iname '*.html' | while read file; do
#	sed -r -i  's#[.]png([^a-z])#.jpg\1#ig' "$file"
#done
#du -shc src/main/webapp/wiki_*

echo "done";


