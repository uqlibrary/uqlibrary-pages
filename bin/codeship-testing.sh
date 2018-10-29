#!/bin/bash
# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -eE

if [ -z ${TMPDIR} ]; then # codeship doesnt seem to set this
  TMPDIR="/tmp/"
fi
SAUCELABS_LOG_FILE="${TMPDIR}sc.log"
echo "On failure, will look for Saucelabs error log here: ${SAUCELABS_LOG_FILE}"

function logSauceCommands {
  if [ ! -f "$SAUCELABS_LOG_FILE" ]; then
    echo "$SAUCELABS_LOG_FILE not found - looking for alt file"
    # testing with check /tmp/sc.log presencewct? it writes to a subdirectory, eg /tmp/wct118915-6262-1w0uwzy.q8it/sc.log
    ALTERNATE_SAUCE_LOCN="$(find ${TMPDIR} -name 'wct*')"
    if [ -d "${ALTERNATE_SAUCE_LOCN}" ]; then
      SAUCELABS_LOG_FILE="${ALTERNATE_SAUCE_LOCN}/sc.log"
    else # debug
      echo "Could not find alternate log file ${ALTERNATE_SAUCE_LOCN}"
    fi
  fi
  if [ -f "$SAUCELABS_LOG_FILE" ]; then
    echo "Command failed - dumping $SAUCELABS_LOG_FILE for debug of saucelabs"
    cat $SAUCELABS_LOG_FILE
  else
    echo "Command failed - attempting to dump saucelabs log file but $SAUCELABS_LOG_FILE not found - did we reach the saucelabs section?"
  fi
}

if [ -z $CI_BRANCH ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
else
  branch=$CI_BRANCH
fi

# "canarytest" is used by a job that runs weekly to test the polymer repos on the upcoming browser versions
# the ordering of the canary browser tests is: test beta, then test dev (beta is closer to ready for prod, per http://www.chromium.org/getting-involved/dev-channel

case "$PIPE_NUM" in
"1")
  # "Unit testing" pipeline on codeship

  if [ ${CI_BRANCH} != "canarytest" ]; then
      # quick single browser testing during dev
      printf "\n --- LOCAL UNIT TESTING ---\n\n"
      cp wct.conf.js.local wct.conf.js
      gulp test
      rm wct.conf.js
  fi

  if [ ${CI_BRANCH} == "production" ]; then
    printf "\n --- REMOTE UNIT TESTING (prod branch only) ---\n\n"
    # split testing into 2 runs so it doesnt occupy all saucelab resources in one hit
    cp wct.conf.js.remoteA wct.conf.js
    gulp test:remote
    rm wct.conf.js

    sleep 10 # seconds

    cp wct.conf.js.remoteB wct.conf.js
    gulp test:remote
    rm wct.conf.js

    printf "\n --- TEST FIREFOX on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-mac --tag e2etest

    printf "\n --- TEST FIREFOX on MAC ESR (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-mac-esr --tag e2etest
  fi

  if [ ${CI_BRANCH} == "canarytest" ]; then
    printf "\n --- LOCAL WCT CANARY UNIT TESTING ---\n\n"
    cp wct.conf.js.canary wct.conf.js
    gulp test:remote
    rm wct.conf.js
    printf "\n --- WCT unit testing complete---\n\n"

    trap logSauceCommands EXIT

    echo "\n-- start server in the background, then sleep to give it time to load --"
    nohup bash -c "gulp serve:dist 2>&1 &"
    sleep 40 # seconds
    cat nohup.out

    printf "\n --- Saucelabs Integration Testing ---\n\n"
    cd bin/saucelabs

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- TEST CHROME Beta on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-beta --tag e2etest

    printf "\n --- TEST CHROME Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-dev --tag e2etest
  fi
;;
"2")
  # "Nightwatch local" pipeline on codeship

  trap logSauceCommands EXIT

  echo "\n-- start server in the background, then sleep to give it time to load --"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

  if [ ${CI_BRANCH} != "canarytest" ]; then
      printf "\n --- Local Integration Testing ---\n"

      printf "\n --- Install Selenium ---\n\n"
      curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s
      cd bin/local

      printf "\n Not testing firefox here atm - selenium would need an upgrade to use a recent enough geckodriver that recent firefox will work - see https://app.codeship.com/projects/131650/builds/34170514 \n\n"

      printf "\n --- TEST CHROME ---\n\n"
      ./nightwatch.js --env chrome --tag e2etest
  fi

  if [ ${CI_BRANCH} == "canarytest" ]; then
    printf "\n --- Saucelabs Integration Testing ---\n\n"
    cd bin/saucelabs

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- TEST FIREFOX Beta on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-windows-beta --tag e2etest

    printf "\n --- TEST FIREFOX Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-windows-dev --tag e2etest
  fi

  if [ ${CI_BRANCH} == "production" ]; then
    printf "\n --- TEST EDGE (prod branch only) ---\n\n"
//    ./nightwatch.js --env edge --tag e2etest

    printf "\n --- TEST CHROME on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env chrome-on-mac --tag e2etest
  fi
;;
"3")
  # "Test commands" pipeline on codeship

  trap logSauceCommands EXIT

  echo "\n-- start server in the background, then sleep to give it time to load --"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

  printf "\n --- Saucelabs Integration Testing ---\n\n"
  cd bin/saucelabs

  # the env names on the call to nightwatch.js must match the entries in saucelabs/nightwatch.json

  if [ ${CI_BRANCH} != "canarytest" ]; then
      # Win/Chrome is our most used browser, 2018
      printf "\n --- TEST CHROME on WINDOWS (default) ---\n\n"
      ./nightwatch.js --tag e2etest

      # test pre-prod, for inconsistencies
      printf "\n --- TEST IE 11 ---\n\n"
      ./nightwatch.js --env ie11 --tag e2etest

      # Win/FF is our second most used browser, 2018 - we have the ESR release on Library Desktop SOE
      printf "\n --- TEST FIREFOX on WINDOWS ESR ---\n\n"
      ./nightwatch.js --env firefox-on-windows-esr --tag e2etest
  fi

  if [ ${CI_BRANCH} == "production" ]; then
    # check all other browsers before going live
    printf "\n --- TEST FIREFOX on WINDOWS (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-windows --tag e2etest

    printf "\n --- TEST SAFARI on MAC (prod branch only) ---\n\n"
    ./nightwatch.js --env safari-on-mac --tag e2etest
  fi

  if [ ${CI_BRANCH} == "canarytest" ]; then
    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- TEST CHROME Beta on MAC (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-mac-beta --tag e2etest

    printf "\n --- TEST CHROME Dev on MAC (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-mac-dev --tag e2etest
  fi
;;
esac
