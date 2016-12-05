#!/bin/bash
# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -e

if [ -z $CI_BRANCH ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
else
  branch=$CI_BRANCH
fi

case "$PIPE_NUM" in
"1")
  # "Unit testing" on codeship
  echo "local unit testing"
  gulp test

  if [ ${CI_BRANCH} == "production" ]; then
    echo "remote unit testing"
    gulp test:remote
  fi

;;
"2")
  # "Nightwatch local" on codeship
  echo "local integration testing"
  echo "install selenium"
  curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s
  cd bin/local
  ./nightwatch.js
  ./nightwatch.js --env chrome
;;
"3")
  # "Nightwatch on saucelabs" on codeship
  cd bin/saucelabs

  echo "test chrome on windows (default)"
  ./nightwatch.js

  if [ ${CI_BRANCH} == "production" ]; then
    echo "test edge"
    ./nightwatch.js --env edge

    echo "test firefox on windows"
    ./nightwatch.js --env firefox-on-windows

    echo "test chrome on mac"
    ./nightwatch.js --env chrome-on-mac

    echo "test firefox on mac"
    ./nightwatch.js --env firefox-on-mac

    echo "test safari on mac"
    ./nightwatch.js --env safari-on-mac
  fi
;;
esac
