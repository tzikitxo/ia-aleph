#!/bin/bash

{ echo 'var a=['; 

for file in  src/main/javascript/data/ia-data_3[67]_*; do cat $file; echo ','; done

echo '{}];'; echo 'for (i in a){ print(a[i].isc); };'; } | js | grep -v undefined | tr '[:upper:]' '[:lower:]' | tr -c '[a-z0-9\n]' '_' | tr -s '_' | sed -e 's#_$##' -e 's#^_##' | while read name; do if ! [ -e src/main/webapp/images/${name}_logo.png ]; then cp -vi src/main/webapp/images/missing_logo.png src/main/webapp/images/${name}_logo.png; cp -vi src/main/webapp/images/missing_logo_small.png src/main/webapp/images/${name}_logo_small.png; fi;   done
