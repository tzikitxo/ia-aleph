#!/bin/bash

xmllint --schema src/main/webapp/data/sectorials.xsd src/main/webapp/data/sectorials.xml --noout || exit

xml fo src/main/webapp/data/sectorials.xml \
	| sed -n 's#.*\(<isc>[^<]*</isc>\).*#\1#p' \
	| while read string; do
		grep "$string" src/main/webapp/data/units.xml >/dev/null || \
			echo "missing isc :\"${string}\"" | sed 's#</?isc>##g'
	done
