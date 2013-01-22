#!/bin/bash

xmllint --schema src/main/webapp/data/sectorials.xsd src/main/webapp/data/sectorials.xml --noout || exit

t=`mktemp`

echo -ne 'Army:\t'
read army
echo -ne 'Nome:\t'
read name
{
	echo -n '<sectorial><army>'
	echo -n "$army" | xml esc
	echo -n '</army><name>'
	echo -n "$name" | xml esc
	echo -n '</name>'
	echo -n '<units>'
} >> $t

while true; do
	echo -ne 'ISC:\t'
	read isc
	[ "$isc" == "" ] && break
	echo -ne 'ava:\t'
	read ava
#	echo -ne 'Link <n>:\t'
#        read link
	{
		echo "<unit><isc>`echo "$isc" | xml esc`</isc><ava>${ava}</ava>"
#		[ "$link" != '' ] && echo '<linkable/>'
		echo '</unit>'
	} >> $t
#	echo -ne 'other? '
#	read cont
#	[ "$cont" == 'n' ] && break
done

echo -ne 'note:\t'
read note

echo "</units><note>`echo "${note}" | xml esc`</note></sectorial>" >> $t

#echo "loaded into $t"

#xmllint --schema src/main/webapp/data/sectorials.xsd src/main/webapp/data/sectorials.xml || exit

#cp sectorials.xml sectorials.xml~
t2=`mktemp /tmp/sectorials_XXXXXXXX.xml`

{
	cat src/main/webapp/data/sectorials.xml | xml fo -t | grep -v '</sectorials>'
	cat $t
	echo -n '</sectorials>'
} > $t2

xmllint --schema src/main/webapp/data/sectorials.xsd $t2 --noout && \
	xml fo -t $t2 > src/main/webapp/data/sectorials.xml

rm $t $t2
#diff sectorials.xml.backup sectorials.xml
