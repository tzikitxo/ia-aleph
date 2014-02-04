#!/bin/bash

#cd ~/ia/src/main/webapp/data/ || exit 1

xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout || exit 1

while read pattern; do
	xml fo src/main/webapp/data/units.xml | grep -i "$pattern" | sed -n 's#.*<isc>\(.*\)</isc>.*#\1#p' | sort | uniq
done
