#!/bin/bash

# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -e

# Update paths in bower_components
gulp clean_bower

cp -R app/bower_components app/test
components=$(ls -d app/test/bower_components/uqlibrary-*/test/*test* | grep -v index)
COUNTER=0
list=""

# Collect all components for testing
for component in ${components[@]}; do
  list="$list '$component',"
done

list="[ $list ]"
dir="app/test/"

cp "app/test/template.index.html" "app/test/index.html"

sed -i -e "s#\[\]#${list}#g" "app/test/index.html"
sed -i -e "s#${dir}##g" "app/test/index.html"

#echo "Check file syntax"
##gulp syntax

echo "Build distribution"
gulp

echo "create nightwatch test script"
#replace Saucelabs keys in nightwatch.js
nightwatchScriptTemp="bin/saucelabs/template.nightwatch.js"
nightwatchScript="bin/saucelabs/nightwatch.js"

cp $nightwatchScriptTemp $nightwatchScript

sed -i -e "s#<SAUCE_USERNAME>#${SAUCE_USERNAME}#g" ${nightwatchScript}
sed -i -e "s#<SAUCE_ACCESS_KEY>#${SAUCE_ACCESS_KEY}#g" ${nightwatchScript}

