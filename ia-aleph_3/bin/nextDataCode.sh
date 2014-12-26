#!/bin/bash

echo $[$(sed -n -r 's#^ *code *: *([0-9]+) *$#\1#p' src/main/javascript/data/data/* | sort -n | tail -n1)+1]

