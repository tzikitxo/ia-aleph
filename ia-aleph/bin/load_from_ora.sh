#!/bin/bash

read unitsNum
read army

echo "<units>"
while [ $unitsNum -gt 0 ]; do
	read
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
	echo "<!-- unit $unitsNum , $modelsNum models -->"
	echo "<unit>"
	for attr in army isc type mov cc bs ph wip arm bts w ava irr imp cube; do
		echo -n "<${attr}>"
		echo "${!attr}" | xml esc | tr -d '\n'
		echo "</${attr}>"
	done
	haveName=''
	while [ $modelsNum -gt 0 ]; do
		echo "<!-- model $modelsNum -->"
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
		fi
		echo "<unit>"
		for attr in cost swc specs bsw ccw; do
                	echo -n "<${attr}>"
                	echo "${!attr}" | xml esc | tr -d '\n'
                	echo "</${attr}>"
        	done
		echo "</unit>"
		modelsNum=$[modelsNum-1]
	done
	echo "</unit>"
	unitsNum=$[unitsNum-1]
done
echo "</units>"
