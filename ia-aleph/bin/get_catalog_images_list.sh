#!/bin/bash

t=`mktemp`

baseUrl='http://www.infinitythegame.com/infinity/en/'

categories='yujing ariadna haqq nomads ca aleph mercs pano'
#categories=' pano'

for army in $categories; do
	echo "${baseUrl}/category/${army}/"
done | wget -i - -O $t || exit 1

#links=`mktemp`
images=`mktemp`

#sed -n -r 's#.*"(http://www.infinitythegame.com/infinity/en/[0-9]+/miniatures/([^/])+/)".*#\2\t\1#p' $t > $links
#sed -r -n 's#.*background:url.(http://www.infinitythegame.com/infinity/catalogo/([0-9-]+)-recorte.png).*<h2>([^<]+)</h2>.*#\2\t\3#p' $t > $images

#rm $t

#cut -f2 $links | head -n10 | wget -i - -O - | sed -n -r 's#.*src="(http://www.infinitythegame.com/infinity/catalogo/([0-9-]+)-[^"]*)" */>.*#\1\t\2\t#p' >> $images

#rm $links

sed -r -n 's#.*background:url.(http://www.infinitythegame.com/infinity/catalogo/([0-9-]+)-recorte.png).*<h2>([^<]+)</h2>.*#\2\t\3#p' $t | while read code name; do
	echo -en "${name}\t${code}\t"
	xml sel -N 'ia=http://anyplace.it/ia' -t -m "//ia:unit/ia:cbCode[text()='${code}']/../ia:isc" -v . -n src/main/webapp/data/units.xml | tr '\n' '\t'
	echo
done | sort > $images

egrep '[0-9][0-9][0-9]+[	]*$' $images > $t
echo >> $t
xml sel -N 'ia=http://anyplace.it/ia' -t -m "//ia:unit[not(ia:cbCode)]/ia:isc" -v . -n src/main/webapp/data/units.xml | sed 's#.*#\t\t&#' >> $t
echo >> $t
egrep -v '[0-9][0-9][0-9]+[	]*$' $images >> $t
cat $t > $images

rm $t

echo "images mapping in $images"

#dest='src/main/webapp/data/images.xml'

#echo "processing images from $images to $dest" >&2

#{
#	echo '<images>'
#	grep -v '	$' $images | while read url code name; do
#		echo -e '\t<codeToName code="'"${code}"'" name="'"$(echo "$name" | xml esc)"'"/>'
#	done
	#cat $images | while read url code name; do
#		echo -e '\t<image code="'"${code}"'" url="'"${url}"'"/>'
#	done
#	echo '</images>'
#} >  "$dest"

#xml val "$dest"

