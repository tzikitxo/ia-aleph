#!/bin/bash

mvn -f pom-compress.xml clean install && rsync -crvP target/ia-aleph/ obox:/var/www/anyplace/ia3/


