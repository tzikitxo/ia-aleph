#!/bin/bash

xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout || exit

t=`mktemp`
if [ -e /tmp/ia_load_unit_isc.temp ]; then
	old_isc="`cat /tmp/ia_load_unit_isc.temp`"
fi

echo -en "isc <$old_isc>:\t"
read isc
[ "$isc" == "" ] && isc="$old_isc"
#echo -en "\nisc=\"${isc}\"" >> $t

for var in code cost swc spec bsw ccw note; do
        echo -en "$var:\t"
        read value
        [ "$value" == "" ] && continue
	if [ $var == 'bsw' ] || [ $var == 'ccw' ] || [ $var == 'spec' ]; then
		echo "$value" | sed 's# *, *#\n#g' | while read val; do echo -en "<${var}>${val}</${var}>" ; done >> $t
	else
        	echo -en "<${var}>${value}</${var}>" >> $t
	fi
done

t2=`mktemp`
#isc="`grep '^isc=' $t | cut -d'"' -f2`"
echo "$isc" > /tmp/ia_load_unit_isc.temp
#sed -i 's# isc="[^"]*"##' $t2
echo -en "-> in \"${isc}\":"
{
        echo -en "<unit>"
        cat $t
        echo -en "</unit>\n"
} | tee $t2

echo -en "inserire nel db <y,n>?\t"
read ans
backup='./src/main/webapp/data/units.xml~'
file='./src/main/webapp/data/units.xml'
if [ "$ans" == "y" ] || [ "$ans" == "" ]; then
       # cd ./src/main/webapp/data/ || exit
        cp -v "$file" "$backup"
	#isc="`grep '^isc=' $t | cut -d'"' -f2`"
	#code="`grep '^code=' $t | cut -d'"' -f2`"
	#t3=`mktemp`
	#t2=`mktemp`
	#xml ed -s '/units/unit[@isc="Hafza Unit"]' -t elem -n unit -v '' units.xml > $t3
	i=`grep -n "<isc>${isc}</isc>" "$file" | head -n1 | cut -d':' -f1`
	i2=`grep "<isc>${isc}</isc>" "$file" -A 99 | grep -n 'unit>' | head -n1 | cut -d':' -f1`
	index=$[i+i2-2]
	t3=`mktemp`
	#export index
	#export file
	#export t2
	{
		#grep -B 99999 '<unit[^>]*isc="'"${isc}"'"'
		head -n $index "$file" #src/main/webapp/data/.units.xml.backup
		cat $t2 # | sed 's# isc="[^"]*"##'
		tail -n +$[index+1] "$file" #src/main/webapp/data/units.xml.backup
		#grep -A 99999 '<unit[^>]*isc="'"${isc}"'"' | tail -n +2
	#	while read line; do
	#		echo "$line"
#			echo "$line" | grep '<unit[^>]*isc="'"${isc}"'"' >/dev/null && break;
#		done
#		cat $t2 # | sed 's# isc="[^"]*"##'
#		cat
#		sed "s#<unit[^>]*isc=\"${isc}\"[^>]*>#&`cat  $t2`#"
	} | xml fo -t > "$t3"
	cp "$t3" "$file"
	rm "$t3"
	#cat units.xml | tr '\n' 'ç' | sed 's#<unit[^>]*isc="'"${isc}"'"[^>]*>
        #t3=`mktemp`
        #{       
        #        cat units.xml | grep -v '</units>' 
        #        cat $t2 
        #        echo '</units>' 
        # } > $t3
        
	#mv $t3 units.xml
fi

rm $t2 $t

#xmldiff "$backup" "$file" 

xmllint --schema src/main/webapp/data/units.xsd src/main/webapp/data/units.xml --noout
#grep -A2 -B1 "isc=\"${isc}\"" units.xml
