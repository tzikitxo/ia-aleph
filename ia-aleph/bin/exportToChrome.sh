#!/bin/bash

target=~/svn/ia-aleph/ia-aleph_chrome/src/

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

cd  ~/svn/ia-aleph/ia-aleph/target/ia-aleph/ || exit
#rm "${target}"/wiki*/*
rsync -crv --delete wiki_* css images js *html "${target}"/
#[ -e wiki_en ] && rsync -crv --delete wiki* "${target}"/

