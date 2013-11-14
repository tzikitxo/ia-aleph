#!/bin/bash

dir="src/main/webapp/images/"
sizeSmall="16x16"
sizeBig="40x40"

cd "$dir" || exit 1

#rm *_logo_small.png
for logo in *_logo.jpg; do
	if [ -e "$logo" ]; then
		new="$(echo "$logo" | sed 's#jpg$#png#')"
		echo "converting $logo -> $new"
		convert "$logo" "$new" && rm "$logo"
	fi
done

for logo in *_logo.png; do
#	big="$(echo "$logo" | sed 's#_logo.png$#_logo_big.png#')"
	if identify "$logo" | grep -q -v "$sizeBig"; then
		echo "resizing $logo ($sizeBig)"
		t="$(mktemp)"
		convert "$logo" -resize "${sizeBig}!" "$t"
		cat "$t" > "$logo"
		rm "$t"
	fi
	dest="$(echo "$logo" | sed 's#_logo.png$#_logo_small.png#')"
	[ -e "$dest" ] && continue
	echo "resizing $logo -> $dest ($sizeSmall)"
	convert "$logo" -resize "${sizeSmall}!" "$dest"
done

