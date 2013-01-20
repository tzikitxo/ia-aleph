#!/bin/bash

cd src/main/webapp/data/ || exit 1

echo -en "Nome:\n\t"
read name
echo -en "Regola:\n\t"
t=`mktemp`
cat | tr '\n\r' '  ' | tr -s ' ' | sed 's#^ ##g' | sed 's# $##g' | xml esc > $t

cp rules.xml rules.xml.backup  || exit 1
{
	echo -n '<rules>'
	xml sel -t -c '//rule' rules.xml.backup
	echo -n '<rule name="'
	echo -n "$name" | sed 's#^ ##g' | sed 's# $##g' | xml esc
	echo -n '">'
	cat $t
	echo -n '</rule></rules>'
	echo
} | xml fo -t > rules.xml

rm $t
diff rules.xml.backup rules.xml
