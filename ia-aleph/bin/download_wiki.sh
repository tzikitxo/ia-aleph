#!/bin/bash

baseUrl="$1"
targetDir="$2"
pages="$3"

indexUrl="${baseUrl}All_Pages"

pushd "$targetDir" || exit 1

ua='Mozilla/5.0 (X11; U; Linux; en-US; rv:1.9.1.16) Gecko/20110929 Firefox/3.5.16'

rm  *
#wget -U "Mozilla/5.0 (X11; U; Linux; en-US; rv:1.9.1.16) Gecko/20110929 Firefox/3.5.16" \
#	-k -p -r -l 1  'http://infinitythegame.wikispot.org/Index' --domains=infinitythegame.wikispot.org -e robots=off 

#sed -n -r 's#<br><a href="([^"]+)".*#\1#p' infinitythegame.wikispot.org/Index > pages.list

index=`mktemp`
wget "$indexUrl" -U "$ua" -e robots=off -O $index

plist=`mktemp`
sed -n -r 's#<br><a href="([^"]+)".*#\1#p' $index > $plist

echo "got `wc -l < $plist` pages to fetch"
#cat $list > pages.list

cat $plist | while read page; do
#	cleanName="`echo "$page" | tr '[:upper:]' '[:lower:]' | tr -d '[^a-z0-9]'`"
#	echo "fetching $page"
#	wget -U "$ua" -e robots=off -p -k "http://infinitythegame.wikispot.org/${page}" 
#-O "${cleanName}.html"
	echo "${baseUrl}${page}"
done | wget -U "$ua" -e robots=off -p -k -E -i -

mv */* ./

echo "downloaded wiki $baseUrl in `pwd`"

popd

cat $plist > "$pages"

echo "pages list in $pages"

rm $plist $index

