#!/bin/bash

target=~/svn/ia-aleph/ia-aleph_ios/www/

cd ~/svn/ia-aleph/ia-aleph/target/ia-aleph/ || exit 1

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

#cd  target/ia-aleph/ || exit
[ -e "${target}"/wiki_en ] && rm "${target}"/wiki*/*
[ -e wiki_en ] && rsync -crv wiki* "${target}"/
rsync -crv css js images "${target}"/

