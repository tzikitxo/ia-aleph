#!/bin/bash

rm -r target/*

mvn -f pom-compress.xml install && bin/exportToAll.sh && ln -s /tmp/ target/ia-aleph/storage

