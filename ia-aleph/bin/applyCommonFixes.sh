#!/bin/bash

source='bin/commonFixes.list'

IFS='	'

cat $source | while read from to; do 
	echo "converting '$from' => '$to'"
#	for file in src/main/javascript/data/*; do
	replace "$from" "$to" -- src/main/javascript/data/*.json
#	done
done
