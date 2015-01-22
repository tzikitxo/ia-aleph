#!/bin/bash

t=`mktemp`
echo '- ' > $t
code=$[`sed -n -r 's# *code *: *([0-9]+) *#\1#p' ./src/main/javascript/data/data/hacking.yml | sort -n | tail -n1`+1]
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
readSingleValue type
echo "  code: $code" >> $t
readSingleValue name
for name in attackMod opponentMod damage burst target skillType special; do
	readSingleValue $name
done

echo "## PROGRAM DATA ##"
cat $t
echo "## PROGRAM DATA ##"
#echo "append data to hacking.yml?"
#read
cat $t >> ./src/main/javascript/data/data/hacking.yml
rm $t

bin/addHackingProgram.sh

