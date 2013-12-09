#!/bin/bash

#dir='/srv/http/ia/'
[ -e bin/last_update ] || exit 1
svn up || exit 1
last_update=`cat bin/last_update`
current=`svn info | sed -n 's#^Revisione: *\([0-9]*\)#\1#p'`

echo "last update: $last_update"
echo "current rev: $current"
#( [ "$last_update" == "$current" ] || [   ] ) && { echo "nothing to do ..."; exit; }
diff=`mktemp`
echo "changes:"
t=`mktemp`
svn diff -r "${last_update}:HEAD"  --summarize | tee $t
echo "uploading: "
cat $t | sed -n 's#[AM] *\(.*\)#\1#p' | grep -v '^bin/\|\.php$' | tee $diff
rm $t

if wc -l $diff | grep '^0 ' &>/dev/null; then 
	echo "nothing to do ..."
else
	wput -i $diff ftp://dafraele:dominiodelmondo@ftp.webalice.it/ia/ && {
			echo "remote synchronized with rev $current"
			echo "$current" > bin/last_update
		} || {
			echo "ERROR"
		}
fi
rm $diff 
