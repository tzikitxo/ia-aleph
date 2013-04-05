#!/bin/bash

xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout || exit

t=`mktemp`
{ 
	echo '<units>'; 
	cat src/main/webapp/data/units.xml \
		| xml fo -t \
		| grep -v '<.xml version="1.0".>\|units>' \
		| tr -d '\n' \
		| sed 's#>\t<unit>#>\n<unit>#g' \
		| tr -d '\t' \
		| sort 
	echo '</units>'; 
} | xml fo -t > $t

xmllint --schema src/main/webapp/data/units.xsd $t --noout && {
	cp -vb $t src/main/webapp/data/units.xml
	rm $t
}
