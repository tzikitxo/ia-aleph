#!/bin/bash

file="$1"
[ -e "$file" ] || exit 1
identify "$file"
convert -fuzz '1%' -trim "$file" "${file}_temp.png" && mv "${file}_temp.png" "$file" || exit 1
size="`identify "$file" | sed -r -n 's#.*PNG ([0-9]+)x.*#\1#p'`"
[ -z $size ] && exit 1
size=$[size/2*2]
convert -size "${size}x${size}" xc:none -fill "$file" -draw "circle $[size/2],$[size/2] $[size/2],1" "${file}_temp.png" && mv "${file}_temp.png" "$file"
identify "$file"

