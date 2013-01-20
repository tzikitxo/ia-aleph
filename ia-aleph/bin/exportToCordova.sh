#!/bin/bash

target=~/svn/ia-aleph/trunk/ia-aleph_cordova/assets/www/

cd ~/svn/ia-aleph/trunk/ia-aleph_v2/target/ia-aleph/

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

#cd  target/ia-aleph/ || exit
rm "${target}"/wiki*/*
rsync -crv css *js data images wiki* "${target}"/

