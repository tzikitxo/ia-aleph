#!/bin/bash

#{ echo 'var a=['; 

for file in  src/main/javascript/data/ia-data_3[67]_*; do 
	echo " testing $file"
	{
		echo '['
		cat $file
		echo ']'
	} | jshon > /dev/null
done 



