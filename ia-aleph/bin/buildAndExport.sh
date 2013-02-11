#!/bin/bash

mvn -f pom-compress.xml install && bin/exportToAll.sh

