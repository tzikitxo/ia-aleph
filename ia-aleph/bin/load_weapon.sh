#!/bin/bash

cd ./src/main/webapp/data/ || exit

t=`mktemp`

for var in name short_dist short_mod medium_dist medium_mod long_dist long_mod max_dist max_mod damage burst ammo template em_vul cc note; do
	echo -en "$var:\t"
        read value
        echo -en "\n${var}=\"${value}\"" >> $t
done 

sed -i 's#^\(.*_dist\)=""#\1="--"#' $t
sed -i 's#^\(.*_mod\)=""#\1="--"#' $t

t2=`mktemp`
{
	echo -en '\t<weapon'
	cat $t | tr '\n' ' '
        echo -en "/>\n"
} | tee $t2

echo -en "inserire nel db <y,n>?\t"
read ans
if [ "$ans" == "y" ] || [ "$ans" == "" ]; then
	cp weapons.xml weapons.xml.backup
	{
		echo '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
		echo '<weapons>'
		{
			grep -v '^<' weapons.xml.backup
			cat $t2
		} | sort
		echo '</weapons>'
	} > weapons.xml
fi

rm $t2 $t
