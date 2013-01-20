#!/bin/bash

target=~/svn/ia-aleph/ia-aleph_android/assets/www/

cd ~/svn/ia-aleph/ia-aleph/target/ia-aleph/

#pushd src/main/webapp/ || exit
#rsync -crv data images "${target}"/
#popd

#cd  target/ia-aleph/ || exit
rm "${target}"/wiki*/*
rsync -crv css *js data images wiki* "${target}"/

