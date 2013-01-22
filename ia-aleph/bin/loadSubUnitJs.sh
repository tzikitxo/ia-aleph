#!/bin/bash

#xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout || exit

t=`mktemp`

#jt=`mktemp`
#ijshon(){
#	file="$1"
#	shift	
#}

#cat units.xml | xml ed -s '/units' -n 'newUnit' -t elem -v '' > $t || exit
#args=''
echo '{' > $t
for var in  code codename cost swc spec bsw ccw note; do
	echo -en "$var:\t"
	read value
#	[ "$value" == "" ] && continue
		echo -n "\"$var\":" >> $t
	if [ $var == 'bsw' ] || [ $var == 'ccw' ] || [ $var == 'spec' ]; then
		echo "[" >> $t
		echo "$value" | sed 's# *, *#\n#g' | while read val; do 
			[ -z "$val" ] || echo -en "\"${val}\"," ; 
		done | sed 's#,$##' >> $t
		echo "]" >> $t
	else
		echo -en "\"${value}\"" >> $t
	fi
	echo -n "," >> $t
#	t2=`mktemp`
#	< $t xml ed -s '/units/newUnit' -n "$var" -t elem -v "$var"
done
echo "\"cbcode\":[]" >> $t
echo '}' >> $t

jshon -S < $t > /dev/null || exit 1
#echo

#jshon < $t 
#jshon < $t | xsel -i
t2=`mktemp`

{
	echo "var unit="
	cat /tmp/ia_load_unit_json.temp
	echo
	echo "var child="
	cat $t
	echo
	echo "unit.childs.push(child);"
	echo "print(JSON.stringify(unit));"
} | js > $t2 || exit 1
jshon -S < $t2 | tee /tmp/ia_load_unit_json.temp
jshon -S < $t2 | xsel -i

rm $t $t2
#isc="`grep '^isc=' $t | cut -d'"' -f2`"
#echo "$isc" > /tmp/ia_load_unit_isc.temp
#t2=`mktemp`
#{
#	echo -en "<unit>"
#	cat $t # | tr '\n' ' ' 
#	echo -en "</unit>"
#} | tee $t2
#rm $t

#backup='./src/main/webapp/data/units.xml~'
#file='./src/main/webapp/data/units.xml'

#echo -en "inserire nel db <y,n>?\t"
#read ans
#if [ "$ans" == "y" ] || [ "$ans" == "" ]; then
#	#cd ./src/main/webapp/data/ || exit 1
#	cp "$file" "$backup"
#	t=`mktemp`
#	{	
#		cat "$file" | grep -v '</units>'
#		cat $t2
#		echo '</units>' 
#	 } | xml fo > $t
#	cp $t "$file"
#	rm $t
#fi

#rm $t2

#xmldiff "$backup" "$file" 

#cd ..

#xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout

#exec ./bin/load_subunit.sh
#grep -A2 -B1 "isc=\"${isc}\"" units.xml
