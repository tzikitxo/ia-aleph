#!/bin/bash

cat | tr '\t' '\n' | grep -v '^$' | while read name; do
	if [ -z "$code" ] || { echo "$name" | egrep -q '^[0-9-]+$'; }; then
		code="$name"
		echo "loading code $code" >&2
	else
		echo "adding code $code to name $name" >&2
		xml ed -L -N 'ia=http://anyplace.it/ia' -s  "//ia:unit/ia:isc[text()='${name}']/.." -t elem -n cbCode -v "${code}" src/main/webapp/data/units.xml
	fi
done
