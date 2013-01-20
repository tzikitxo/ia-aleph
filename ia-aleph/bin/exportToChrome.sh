#!/bin/bash

target=~/svn/ia-aleph/ia-aleph_chrome/src/

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

cd  ~/svn/ia-aleph/ia-aleph/target/ia-aleph/ || exit
rm "${target}"/wiki*/*
rsync -crv wiki* css data images *js *html "${target}"/

