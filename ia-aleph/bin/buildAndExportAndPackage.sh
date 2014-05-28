#!/bin/bash

bin/buildAndExport.sh

{
	cd ../ia-aleph_chrome/
	bin/packageCrx.sh
}
