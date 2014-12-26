#!/bin/bash

t=`mktemp`
echo '- ' > $t
for name in isc longisc; do
	echo -n "  $name : "
	read value
	echo "  $name: $value" >> $t
done
code=`bin/nextDataCode.sh`
echo "  code: $code" >> $t
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
readSingleValue faction "`cat /tmp/factionId`" /tmp/factionId
readSingleValue logo "`grep '^ *isc *:' $t | tail -n1 | sed 's# *isc *: *##' | tr '[:upper:]' '[:lower:]' | tr -c '[a-z0-9]' '_' | tr -s '_' | sed -r 's#^_|_$##g'`"
for name in name type classification mov cc bs ph wip arm bts w s ava backup irregular impetuosity; do
	readSingleValue $name
 #       echo -n "  $name : "
 #       read value
	#[ -z "$value" ] || echo "  $name: $value" >> $t
done
for name in skills equipments bsw ccw; do
        echo -n "  $name : "
        read value
        [ -z "$value" ] || echo "  $name: [ $value ]" >> $t
done
echo "  options:" >> $t

echo "## TROOPER DATA ##"
cat $t
echo "## TROOPER DATA ##"
echo "append data to troopers.yml?"
read
cat $t >> ./src/main/javascript/data/data/troopers.yml
rm $t

bin/addTrooperOption.sh 1

