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

if [ -z $CI_BRANCH ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
else
  branch=$CI_BRANCH
fi

# "canarytest" is used by a job that runs weekly to test the polymer repos on the upcoming browser versions

case "$PIPE_NUM" in
"1")
  # because codeship can be a little flakey, we arent wasting part of our canary test on general tests that arent relevent
  if [ ${CI_BRANCH} != "canarytest" ]; then
      # "Unit testing" pipeline on codeship
      printf "\n --- LOCAL UNIT TESTING ---\n\n"
      gulp test

  fi

  if [ ${CI_BRANCH} == "production" ]; then
    printf "\n --- REMOTE UNIT TESTING (prod branch only) ---\n\n"
    gulp test:remote
  fi
;;
"2")
  if [ ${CI_BRANCH} != "canarytest" ]; then
      # "Nightwatch local" pipeline on codeship
      printf "\n --- Local Integration Testing ---\n"

      printf "\n --- Install Selenium ---\n\n"
      curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s
      cd bin/local

      printf "\n Not testing firefox here atm - selenium would need an upgrade to use a recent enough geckodriver that recent firefox will work - see https://app.codeship.com/projects/131650/builds/34170514 \n\n"

      printf "\n --- TEST CHROME ---\n\n"
      ./nightwatch.js --env chrome --tag e2etest
  fi
;;
"3")
  # "Test commands" pipeline on codeship

  trap logSauceCommands EXIT

  printf "\n --- Saucelabs Integration Testing ---\n\n"
  cd bin/saucelabs

  # these env names must match the entries in saucelabs/nightwatch.json
  if [ ${CI_BRANCH} != "canarytest" ]; then
      # Win/Chrome is our most used browser, 2018
      printf "\n --- TEST CHROME on WINDOWS (default) ---\n\n"
      ./nightwatch.js --tag e2etest

      # test pre-prod, for inconsistencies
      printf "\n --- TEST IE 11 ---\n\n"
      ./nightwatch.js --env ie11 --tag e2etest

      # Win/FF is our second most used browser, 2018
      printf "\n --- TEST FIREFOX on WINDOWS ---\n\n"
      ./nightwatch.js --env firefox-on-windows --tag e2etest
  fi

  if [ ${CI_BRANCH} == "production" ]; then
    # check all other browsers before going live
    printf "\n --- TEST SAFARI on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env safari-on-mac --tag e2etest

    printf "\n --- TEST EDGE (prod branch only) ---\n\n"
    ./nightwatch.js --env edge --tag e2etest

    printf "\n --- TEST CHROME on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env chrome-on-mac --tag e2etest

    printf "\n --- TEST FIREFOX on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-mac --tag e2etest
  fi

  if [ ${CI_BRANCH} == "canarytest" ]; then
    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- TEST CHROME Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-dev --tag e2etest

    printf "\n --- TEST CHROME Beta on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-beta --tag e2etest

    printf "\n --- TEST FIREFOX Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-windows-dev --tag e2etest

    printf "\n --- TEST FIREFOX Beta on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-windows-beta --tag e2etest

    printf "\n --- TEST CHROME Dev on MAC (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-mac-dev --tag e2etest

    printf "\n --- TEST CHROME Beta on MAC (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-mac-beta --tag e2etest

    printf "\n --- TEST FIREFOX Dev on MAC (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-mac-dev --tag e2etest

    printf "\n --- TEST FIREFOX Beta on MAC (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-mac-beta --tag e2etest
  fi
;;
esac
