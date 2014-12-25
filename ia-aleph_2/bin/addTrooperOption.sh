#!/bin/bash

code="$1"
echo "adding trooper option $code"
t=`mktemp`
echo '  - ' > $t
echo "    code: $code" >> $t
for name in description skills equipments bsw ccw; do
	echo -n "  $name : "
	read value
	[ -z "$value" ] || echo "    $name: [ $value ]" >> $t
done
for name in swc cost; do
        echo -n "  $name : "
        read value
        [ -z "$value" ] || echo "    $name: $value" >> $t
done

echo "## TROOPER OPTION DATA ##"
cat $t
echo "## TROOPER OPTION DATA ##"
echo "append data to troopers.yml?"
read
cat $t >> ./src/main/javascript/data/data/troopers.yml
rm $t

bin/addTrooperOption.sh $[code+1]

