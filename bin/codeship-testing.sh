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
  # "Unit testing" on codeship
    echo "local unit testing"
    gulp test
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
    # "Test Commands" on codeship
      cd bin/saucelabs

      echo "test chrome on windows (default)"
      ./nightwatch.js
  ;;
  esac
  ;;
*)
  case "$PIPE_NUM" in
  "1")
  # "Unit testing" on codeship
    echo "local unit testing"
    gulp test
    echo "remote unit testing"
    gulp test:remote
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
  # "Test Commands" on codeship
    cd bin/saucelabs

    echo "test chrome on windows (default)"
    ./nightwatch.js

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

  ;;
  esac
  ;;
esac