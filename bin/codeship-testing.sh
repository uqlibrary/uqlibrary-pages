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
  ./nightwatch.js --tag e2etest
  ./nightwatch.js --env chrome --tag e2etest
;;
"3")
  # "Nightwatch on saucelabs" on codeship
  cd bin/saucelabs

  echo "test chrome on windows (default)"
  ./nightwatch.js --tag e2etest

  if [ ${CI_BRANCH} == "production" ]; then
    echo "test edge"
    ./nightwatch.js --env edge --tag e2etest

    echo "test firefox on windows"
    ./nightwatch.js --env firefox-on-windows --tag e2etest

    echo "test chrome on mac"
    ./nightwatch.js --env chrome-on-mac --tag e2etest

    echo "test firefox on mac"
    ./nightwatch.js --env firefox-on-mac --tag e2etest

    echo "test safari on mac"
    ./nightwatch.js --env safari-on-mac --tag e2etest
  fi
;;
esac
