#!/bin/bash

target=~/svn/ia-aleph/ia-aleph_android/assets/www/

cd ~/svn/ia-aleph/ia-aleph/target/ia-aleph/

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

#cd  target/ia-aleph/ || exit
#rm "${target}"/wiki*/*
rsync -crv --delete --exclude cordova*js css js images wiki_* "${target}"/

t=`mktemp /tmp/file.XXXXXXXX`

{
	grep -B 999 '</head>' "${target}"/ia.html
	grep -A 999 '<body>' ia.html
} > $t

if diff -q $t "${target}"/ia.html | grep -q .; then
	cat $t > "${target}"/ia.html
fi

rm $t

