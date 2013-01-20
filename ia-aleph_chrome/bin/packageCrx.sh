#!/bin/bash -e
#
# Purpose: Pack a Chromium extension directory into crx format
#if test $# -ne 2; then
#  echo "Usage: crxmake.sh <extension dir> <pem path>"
#  exit 1
#fi
cd ~/svn/ia-aleph/trunk/ia-aleph_chrome/target/ || exit 1
dir=../src/
key=../extras/key.pem
#name=IaChrome
crx="ia.crx"
pub="ia.pub"
sig="ia.sig"
zip="ia.zip"
 
[ -e ia.zip ] && rm *

currentRevision="$(sed -r -n 's#.*"version".*[.]([0-9]+)".*#\1#p' $dir/manifest.json)"
nextRevision=$[currentRevision+1]
sed -r -i 's#(.*"version".*[.])[0-9]+(".*)#\1'${nextRevision}'\2#' $dir/manifest.json
sed -r -i "s#version='[^'+]'#version='${nextRevision}'#" ../extras/chromeAppUpdates.xml
cp ../extras/chromeAppUpdates.xml ./
echo "new revision: $nextRevision"

echo "fixing images perms"
t=`mktemp`
{
	grep -v '^ *"images/' $dir/manifest.json | head -n-3 
	echo
	pushd $dir/ >/dev/null
	for file in images/*; do
		echo "\"${file}\","
	done
	popd >/dev/null
	echo "\"images/x\""
	echo ']'
	echo '}'
} > $t
cp $t $dir/manifest.json
rm $t

echo "packaging"

#cleanup
#trap 'rm -f "$pub" "$sig" "$zip"' EXIT

# zip up the crx dir
cwd=$(pwd -P)
(cd "$dir" && zip -qr -9 -X "$cwd/$zip" .)
echo "built zip target/ia.zip"

if [ -e "$key" ]; then
## signature
#openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"
## public key
#openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null
#byte_swap () {
#  # Take "abcdefgh" and return it as "ghefcdab"
#  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
#}
#crmagic_hex="4372 3234" # Cr24
#version_hex="0200 0000" # 2
#pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
#sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
#(
#  echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
##  cat "$pub" "$sig" "$zip"
#) > "$crx"
#	../bin/buildcrx-v1.0 $zip $key $crx
	ln -s ../src/ ia
	chromium --pack-extension=ia/ --pack-extension-key=$key  --no-message-box
	rm ia

#	cp -v $crx ../../ia-aleph_v2/target/ia-aleph/
	echo "built target/$crx"
else
	echo "missing key $key , unable to build crx"
fi

cp * ~/download/ -v
