#!/bin/bash

sedScript=`mktemp`

for regexp in  's#(: *"(.*[^\]|))"(.*")#\1\\"\3#g'; do
	for i in  {1..5}; do
		echo "$regexp" >> $sedScript
	done
done

#remove newline
#echo ':a;N;$!ba;s/\n/ /g' >> $sedScript

echo 's#	+# #g' >> $sedScript

#echo "executing $args"

sed -i -r -f $sedScript src/main/javascript/data/ia-data_*_data.json

rm $sedScript

