#!/bin/bash

echo -en "Army:\t"
read army
echo -e "Paste unit:"

t=`mktemp /tmp/new_unit_XXXXXX.xml`

cat | grep -v '^\[PERS]$' | sed 's# *, *#,#g' | { 
read modelsNum
read isc
read type
read mov1 mov2 cc bs ph wip arm bts w ava
mov="${mov1}-${mov2}"
[ "$ava" == "TOTAL" ] && ava="T"
read line
read specs
line="`echo "$line" | sed 's# *, *#,#g'`"
irr="`echo "$line" | cut -d',' -f1`"
[ "$irr" == "Irregular" ] && irr="X" || irr=""
imp="`echo "$line" | cut -d',' -f2`"
case "$imp" in
	"Impetuous") imp="X" ;;
	"Frenzy") specs="${specs},Frenzy"; imp="F" ;;
	"Not Impetuous") imp="" ;;
esac
cube="`echo "$line" | cut -d',' -f3`"
case "$cube" in
	"Cube") cube="X" ;;
	"No Cube") cube="" ;;
	*) specs="${specs},$cube"; cube="R"; ;;
esac
echo "<unit>" >> $t
for attr in army isc type mov cc bs ph wip arm bts w ava irr imp cube; do
	echo -n "<${attr}>"
	echo "${!attr}" | xml esc | tr -d '\n'
	echo "</${attr}>"
done >> $t
	haveName=''
while [ $modelsNum -gt 0 ]; do
#		echo "<!-- model $modelsNum -->"
	read line
	name="`echo "$line" | cut -d'(' -f1 | sed 's# *$##'`"
	specs="`echo "$line" | sed -n 's#.*( *\(.*\) *)#\1#p' | sed 's# *, *#,#g'`"
	read bsw
	read ccw
	read swc cost
	if [ "$haveName" == '' ]; then
		echo -n "<name>"
		echo "$name"  | xml esc | tr -d '\n'
		echo "</name>"
		haveName='X'
	fi >> $t
	echo "<unit>" >> $t
	for attr in cost swc specs bsw ccw; do
               	echo -n "<${attr}>"
               	echo "${!attr}" | xml esc | tr -d '\n'
               	echo "</${attr}>"
       	done >> $t
	echo "</unit>" >> $t
	modelsNum=$[modelsNum-1]
done
echo "</unit>" >> $t
}
t2=`mktemp`
xml fo -t $t > $t2 || exit
mv $t2 $t
#	unitsNum=$[unitsNum-1]
#done
#echo "</units>"
bluefish $t
echo "insert into units.xml?"
read ans

