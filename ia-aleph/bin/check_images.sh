#!/bin/bash

#cd ~/ia/ || exit 1
xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout || exit

t=`mktemp`

xml sel  -N ia="http://anyplace.it/ia" -t -m '//ia:unit/ia:isc' -v '.' -n  src/main/webapp/data/units.xml \
	| tr -s '\n' \
	| sort \
	| uniq \
	| tr [:upper:] [:lower:] \
	| tr -c '[a-z0-9\n]' _ \
	| sed -r 's#_*(.*)_*#\1_logo.png#' \
	| tr -s _ \
	| tee $t \
	| while read file; do 
		[ -e src/main/webapp/images/${file} ] || echo "missing ${file}"; 
	done

#cd src/main/webapp/images/
#ls images/ | while read file; do 
#	grep "^${file}\$" $t >/dev/null || echo "unused ${file}"; 
#done

rm $t
