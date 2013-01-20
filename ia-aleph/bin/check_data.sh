#!/bin/bash


xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout || exit

{
	weapons=`mktemp`
	units=`mktemp`
	xml sel -t -m '//bsw|//ccw' -m 'item' -v '.' -n src/main/webapp/data/units.xml | tr -s '\n' \
		| sed 's#.* ([0-9]*)##' | sort | uniq > $units
	xml sel -t -m '//weapon' -v '@name' -n src/main/webapp/data/weapons.xml | tr -s '\n' > $weapons
	echo "weapons:"
	cat $weapons $units | sort | uniq -u | grep -v '^$' | while read weapon; do
		if grep "$weapon" $weapons &>/dev/null; then
			echo -e "\tOnly in weapons.xml: \"${weapon}\""
		else
			index="`grep -n "${weapon}" src/main/webapp/data/units.xml | cut -d':' -f1 | tr '\n' ',' | sed 's#,$##'`"
			echo -e "\tOnly in units.xml:   \"${weapon}\" (${index})"
		fi
	done | sort
	rm $weapons $units
}

{
	loadedIscs=`mktemp`
	allIscs='src/main/webapp/data/units.list'
	orderable=`mktemp`
	unOrderable=`mktemp`
	xml sel -t -m '//isc' -v '.' -n src/main/webapp/data/units.xml | tr -s '\n' > $loadedIscs
	echo "units:"
	cat $loadedIscs $allIscs  | sort | uniq -u | grep -v '^$' | grep -v '^#' | while read isc; do
		if grep "^${isc}\$" $loadedIscs &>/dev/null; then
			echo -e "\tonly in units.xml: \"${isc}\" (`echo "${isc}" | xml esc`)"
			echo "${isc}" >> $unOrderable
		else
			echo -e "\tonly in units.list: \"${isc}\" (`echo "${isc}" | xml esc`)"
			echo "${isc}" >> $orderable
		fi
	done | sort
	newUnist=`mktemp`
#	echo -e '<?xml version="1.0"?>\n<?xml-stylesheet type="text/xsl" href="units.xsl"?>\n<units>' >> $newUnist
	sourceUnits=`mktemp /tmp/sourceUnist_XXXXXXXX.xml`
	cat src/main/webapp/data/units.xml \
		| xml fo -t \
		| grep -v '<?' \
		| grep -v 'units>' \
		| tr -d '\n' \
		| sed 's#>\t<unit>#>\n<unit>#g' \
		| tr -d '\t' > $sourceUnits
	wc -l $sourceUnits
	cat $allIscs $unOrderable | while read isc; do 
		grep "<isc>`echo "$isc" | xml esc`</isc>" $sourceUnits
	done  > $newUnist
#	echo '</units>' >> $newUnist
	wc -l $newUnist
	t=`mktemp`
	{
		echo -e '<?xml version="1.0"?>\n<?xml-stylesheet type="text/xsl" href="units.xsl"?>\n<units>'
		cat $newUnist
		echo '</units>'
	} | xml fo -t > $t
	xmllint --schema src/main/webapp/data/units.xsd $t --noout && cp -bv $t src/main/webapp/data/units.xml 
	chmod +r  src/main/webapp/data/units.xml
	rm $loadedIscs $unOrderable $orderable $newUnist $t
}
