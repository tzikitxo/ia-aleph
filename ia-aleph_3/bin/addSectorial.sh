#!/bin/bash

d=./src/main/javascript/data/data/sectorials.yml
code=$[`sed -n -r 's#^  code *: *([0-9]+) *#\1#p' ./src/main/javascript/data/data/sectorials.yml | sort -n | tail -n1`+1]
function readSingleValue(){
	name="$1"
	default="$2"
	saveValueTo="$3"
	echo -n "  $name ($default) : "
	read value
	if [ -z "$value" ] && ! [ -z "$default" ]; then
		value="$default"
	fi
	[ -z "$value" ] || echo "  $name: $value" >> $d
	[ -z "$saveValueTo" ] || echo "$value" > "$saveValueTo"
}
#readSingleValue faction "`cat /tmp/factionId`" /tmp/factionId
#readSingleValue logo "`grep '^ *isc *:' $t | tail -n1 | sed 's# *isc *: *##' | tr '[:upper:]' '[:lower:]' | tr -c '[a-z0-9]' '_' | tr -s '_' | sed -r 's#^_|_$##g'`"


echo "-" >> $d
readSingleValue name
echo "  code: $code" >> $d
readSingleValue faction "`cat /tmp/factionId`" /tmp/factionId
defaultLogo="`grep '^ *name *:' $d | tail -n1 | sed 's# *name *: *##' | tr '[:upper:]' '[:lower:]' | tr -c '[a-z0-9]' '_' | tr -s '_' | sed -r 's#^_|_$##g'`"
echo "    available logo file: `find src/ -name "${defaultLogo}_logo.png"`"
readSingleValue logo "$defaultLogo"

echo "  troopers:" >> $d

while true; do
	echo -n "add/search trooper: "
	read trooper
	if echo "$trooper" | egrep -q '^[0-9]+$'; then		
		echo -n "  ava: "
		read ava
		echo -n "  link [n]: "
		read link
		echo "  -" >> $d
		echo "    code: $trooper" >> $d
		echo "    ava: $ava" >> $d
		[ -z "$link" ] || echo "    link: true" >> $d
	else
		bin/findUnitCode.sh "$trooper"
	fi
done

#for name in name ; do
#	readSingleValue $name
 #       echo -n "  $name : "
 #       read value
	#[ -z "$value" ] || echo "  $name: $value" >> $t
#done
#for name in ranges mods; do
#        echo -n "  $name : "
#        read value
#        [ -z "$value" ] || echo "  $name: [ $value ]" >> $t
#done
#for name in damage burst ammunitions; do
#	readSingleValue $name
#done
#echo -n "  traits : "
#read value
#[ -z "$value" ] || echo "  traits: [ $value ]" >> $t
#echo "  options:" >> $t

#echo "## WEAPON DATA ##"
#cat $t
#echo "## WEAPON DATA ##"
#echo "append data to weapons.yml?"
#read
#cat $t >> ./src/main/javascript/data/data/weapons.yml
#rm $t
#
#bin/addWeapon.sh
##
