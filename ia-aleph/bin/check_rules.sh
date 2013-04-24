#!/bin/bash

xmllint --schema src/main/webapp/data/rules.xsd src/main/webapp/data/rules.xml --noout || exit
xml tr src/main/webapp/data/rules.xsl src/main/webapp/data/rules.xml | grep -v '<meta' | xml val -
