#!/bin/bash

t=`mktemp`
echo '- ' > $t
code=$[`sed -n -r 's# *code *: *([0-9]+) *#\1#p' ./src/main/javascript/data/data/weapons.yml | sort -n | tail -n1`+1]
function readSingleValue(){
	name="$1"
	default="$2"
	saveValueTo="$3"
	echo -n "  $name ($default) : "
	read value
	if [ -z "$value" ] && ! [ -z "$default" ]; then
		value="$default"
	fi
	[ -z "$value" ] || echo "  $name: $value" >> $t
	[ -z "$saveValueTo" ] || echo "$value" > "$saveValueTo"
}
#readSingleValue faction "`cat /tmp/factionId`" /tmp/factionId
#readSingleValue logo "`grep '^ *isc *:' $t | tail -n1 | sed 's# *isc *: *##' | tr '[:upper:]' '[:lower:]' | tr -c '[a-z0-9]' '_' | tr -s '_' | sed -r 's#^_|_$##g'`"

readSingleValue name
echo "  code: $code" >> $t
readSingleValue mode
#for name in name ; do
#	readSingleValue $name
 #       echo -n "  $name : "
 #       read value
	#[ -z "$value" ] || echo "  $name: $value" >> $t
#done
for name in ranges mods; do
        echo -n "  $name : "
        read value
        [ -z "$value" ] || echo "  $name: [ $value ]" >> $t
done
for name in damage burst ammunitions; do
	readSingleValue $name
done
echo -n "  traits : "
read value
[ -z "$value" ] || echo "  traits: [ $value ]" >> $t
#echo "  options:" >> $t

echo "## WEAPON DATA ##"
cat $t
echo "## WEAPON DATA ##"
echo "append data to weapons.yml?"
read
cat $t >> ./src/main/javascript/data/data/weapons.yml
rm $t

bin/addWeapon.sh

