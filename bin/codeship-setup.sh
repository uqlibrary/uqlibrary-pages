#!/bin/bash

# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -e

echo "Install prerequisites gulp/bower/packages"

echo "Set Java version to Java8"
jdk_switcher use oraclejdk8
java -version

echo "Install dependencies"
npm install -g gulp bower
npm install
bower install


