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
for var in  name {short,medium,long,max}{dist,mod} damage burst ammo template em_vul cc note; do
	echo -en "$var:\t"
	read value
#	[ "$value" == "" ] && continue
	
		echo -en "\"${var}\":\"${value}\"," >> $t
	#echo -n "," >> $t
#	t2=`mktemp`
#	< $t xml ed -s '/units/newUnit' -n "$var" -t elem -v "$var"
done

echo '}' >> $t

sed -i 's#,}#}#' $t

jshon -S < $t | tee /tmp/ia_load_weapon_json.temp
jshon -S < $t | xsel -i
t2=`mktemp`
cp -v  src/main/javascript/data/ia-data_25_weapons_data.json $t2 || exit 1
{
	cat $t2 | sed  's#\]#,#' 
	cat $t
	echo ']'
} | jshon -S > src/main/javascript/data/ia-data_25_weapons_data.json || cp -v $t2 src/main/javascript/data/ia-data_25_weapons_data.json
rm $t


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
