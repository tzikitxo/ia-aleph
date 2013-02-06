#!/bin/bash

target=~/svn/ia-aleph/ia-aleph_ios/www/

cd ~/svn/ia-aleph/ia-aleph/target/ia-aleph/ || exit 1

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

#cd  target/ia-aleph/ || exit
#[ -e "${target}"/wiki_en ] && rm "${target}"/wiki*/*

#[ -e wiki_en ] && rsync -crv wiki* "${target}"/

#rsync -crv css js images "${target}"/

rsync -crv --delete --exclude cordova*js css js images wiki_* "${target}"/

t=`mktemp`

{
        grep -B 999 '</head>' "${target}"/ia.html
        grep -A 999 '<body>' ia.html
} > $t

if diff -q $t "${target}"/ia.html | grep -q .; then
        cat $t > "${target}"/ia.html
fi

rm $t

