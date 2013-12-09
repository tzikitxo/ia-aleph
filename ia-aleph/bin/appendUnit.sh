#!/bin/bash

[ -e /tmp/ia_load_unit_json.temp ] || exit 1

name=`sed -n -r 's#.*"army" *: *"(.*)" *, *#\1#p' /tmp/ia_load_unit_json.temp | tr '[:upper:]' '[:lower:]' | tr -d -c  '[a-z]' | head -c4`
target=`ls src/main/javascript/data/ia-data_3?_${name}_units_data.json`

[ -e $target ] || exit 1

echo "appending to $target"

echo ',' >> $target
cat /tmp/ia_load_unit_json.temp >> $target

