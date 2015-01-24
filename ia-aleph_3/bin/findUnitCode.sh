#!/bin/bash

grep -i "^  .*isc:.*$1" -A15 src/main/javascript/data/data/troopers.yml | egrep '^  .*isc:|^  code:'
