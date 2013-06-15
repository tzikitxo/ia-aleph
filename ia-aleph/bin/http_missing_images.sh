#!/bin/bash

log='/var/log/httpd/error_log'
t=`mktemp`

#{ cat "$log"; tail -n 0 -f "$log"; } | \
tail -f "$log" | while read line; do echo "$line" | \
	sed -n 's#.*File does not exist: .*ia/images/\(.*png\).*#\1#p' | \
	while read image; do 
		[ -e ~/progetti/ia/images/"${image}" ] && continue
		t2=`mktemp`
		{ cat "$t"; echo "$image"; } | sort | uniq > $t2
		cat $t $t2 | sort | uniq -u
		mv $t2 $t
	done
done
