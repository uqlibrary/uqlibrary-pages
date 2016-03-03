#!/bin/bash

# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -e

echo "Install prerequisites gulp/bower/packages"

npm install -g gulp bower

npm install
bower install

echo "Deploying branch: ${CI_BRANCH}"

branch=${CI_BRANCH}
src=$(git rev-parse --show-toplevel)
base=$(basename ${src})
dest="${base/uqlibrary-/}"

pwd
cd ../${base}
pwd

# test components
gulp clean_bower
cp -R app/bower_components app/test
components=$(ls -d app/test/bower_components/uqlibrary-*/test/* | grep -v index)
COUNTER=0
list=""

# Collect all components for testing
for component in ${components[@]}; do
  list="$list '$component',"
done

list="[ $list ]"
dir="app/test/"

sed -i -e "s#\[\]#${list}#g" "app/test/index.html"
sed -i -e "s#${dir}##g" "app/test/index.html"

#gulp test

#echo "Check file syntax"
##gulp syntax
#
echo "Build distribution"
gulp

# If these files are the same, it means an error in vulcanizing
echo "Checking vulcanization was performed correctly"
set +e
result=`diff dist/elements/elements.html app/elements/elements.html`
set -e

if [ -z "${result}" ]; then
    echo "Improperly vulcanized file"
    echo "This happens sporadically, rebuilding should fix"
    exit 1;
fi

if ! [ -f dist/elements/elements.js ]; then
    echo "Improperly vulcanized file - missing vulcanized.js"
    exit 1;
fi
