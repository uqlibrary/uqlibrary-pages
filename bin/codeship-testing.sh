#!/bin/bash
# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -eE

function logSauceCommands {
 SAUCELABS_LOG_FILE="/tmp/sc.log"
 if [ -f {$SAUCELABS_LOG_FILE} ]; then
  echo "Command failed - dumping {$SAUCELABS_LOG_FILE} for debug of saucelabs"
  cat /tmp/sc.log
 else
   echo "Command failed - attempting to dump saucelabs log file but {$SAUCELABS_LOG_FILE} not found - did we reach the saucelabs section?"
 fi
}

trap logSauceCommands EXIT

if [ -z $CI_BRANCH ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
else
  branch=$CI_BRANCH
fi

case "$PIPE_NUM" in
"1")
  # "Unit testing" on codeship
  printf "\n --- LOCAL UNIT TESTING ---\n\n"
  gulp test

  if [ ${CI_BRANCH} == "production" ]; then
    printf "\n --- REMOTE UNIT TESTING (prod branch only) ---\n\n"
    gulp test:remote
  fi

;;
"2")
  # "Nightwatch local" on codeship
  printf "\n --- Local Integration Testing ---\n"

  printf "\n --- Install Selenium ---\n\n"
  curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s
  cd bin/local

  printf "\n --- TEST FIREFOX (default) ---\n\n"
  ./nightwatch.js --tag e2etest

  printf "\n --- TEST CHROME ---\n\n"
  ./nightwatch.js --env chrome --tag e2etest
;;
"3")
  # "Nightwatch on saucelabs" on codeship
  printf "\n --- Saucelabs Integration Testing ---\n\n"
  cd bin/saucelabs

  printf "\n --- TEST CHROME on WINDOWS (default) ---\n\n"
  ./nightwatch.js --tag e2etest

  # temporaily here to see what it does pre-prod, if usable move inside prod if, below
  printf "\n --- TEST IE 11 ---\n\n"
  ./nightwatch.js --env ie11 --tag e2etest

  if [ ${CI_BRANCH} == "production" ]; then
    printf "\n --- TEST EDGE (prod branch only) ---\n\n"
    ./nightwatch.js --env edge --tag e2etest

    printf "\n --- TEST FIREFOX on WINDOWS (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-windows --tag e2etest

    printf "\n --- TEST CHROME on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env chrome-on-mac --tag e2etest

    printf "\n --- TEST FIREFOX on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-mac --tag e2etest

    printf "\n --- TEST SAFARI on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env safari-on-mac --tag e2etest
  fi
;;
esac
