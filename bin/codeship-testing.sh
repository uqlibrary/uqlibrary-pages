#!/bin/bash

if [ -z $CI_BRANCH ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
else
  branch=$CI_BRANCH
fi

case "$branch" in
"master")
  case "$PIPE_NUM" in
  "1")
    echo "local unit testing"
    gulp test
  ;;
  "2")
    echo "local integration testing"
    echo "install selenium"
    curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s
    cd bin/local
    ./nightwatch.js
    ./nightwatch.js --env chrome
  ;;
  esac
  ;;
*)
  case "$PIPE_NUM" in
  "1")
    echo "local unit testing"
    gulp test
    echo "remote unit testing"
    gulp test:remote
  ;;
  "2")
    echo "local integration testing"
    echo "install selenium"
    curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s
    cd bin/local
    ./nightwatch.js
    ./nightwatch.js --env chrome
  ;;
  "3")
    cd bin/saucelabs
    ./nightwatch.js
    ./nightwatch.js --env ie11
  ;;
  esac
  ;;
esac