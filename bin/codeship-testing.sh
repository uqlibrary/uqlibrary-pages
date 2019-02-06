#!/bin/bash
# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -eE

# if you want to log any saucelab errors to the codeship log, set LOG_SAUCELAB_ERRORS to true in the codeship variables
# at https://app.codeship.com/projects/131650/environment/edit;
# else leave it missing in codeship environment variables or false
if [[ -z $LOG_SAUCELAB_ERRORS ]]; then
    LOG_SAUCELAB_ERRORS=false
fi
if [[ "$LOG_SAUCELAB_ERRORS" == true ]]; then
    if [[ -z ${TMPDIR} ]]; then # codeship doesnt seem to set this
      TMPDIR="/tmp/"
    fi

    SAUCELABS_LOG_FILE="${TMPDIR}sc.log"
    echo "On failure, will look for Saucelabs error log here: ${SAUCELABS_LOG_FILE}"
fi

function logSauceCommands {
  if [[ "$LOG_SAUCELAB_ERRORS" != true ]]; then
    echo "An error happened and (presumably) saucelabs failed but we arent reporting the output - set LOG_SAUCELAB_ERRORS to true in Codeship Environment Variables to see the log next time"
    return
  fi

  if [[ ! -f "$SAUCELABS_LOG_FILE" ]]; then
    echo "$SAUCELABS_LOG_FILE not found - looking for alt file"
    # testing with check /tmp/sc.log presencewct? it writes to a subdirectory, eg /tmp/wct118915-6262-1w0uwzy.q8it/sc.log
    ALTERNATE_SAUCE_LOCN="$(find ${TMPDIR} -name 'wct*')"
    if [[ -d "${ALTERNATE_SAUCE_LOCN}" ]]; then
      SAUCELABS_LOG_FILE="${ALTERNATE_SAUCE_LOCN}/sc.log"
    else # debug
      echo "Could not find alternate log file ${ALTERNATE_SAUCE_LOCN}"
    fi
  fi
  if [[ -f "$SAUCELABS_LOG_FILE" ]]; then
    echo "Command failed - dumping $SAUCELABS_LOG_FILE for debug of saucelabs"
    cat $SAUCELABS_LOG_FILE
  else
    echo "Command failed - attempting to dump saucelabs log file but $SAUCELABS_LOG_FILE not found - did we reach the saucelabs section?"
  fi
}

if [[ -z $CI_BRANCH ]]; then
  CI_BRANCH=$(git rev-parse --abbrev-ref HEAD)
fi

if [[ -z $PIPE_NUM ]]; then
  PIPE_NUM=3
fi

# "canarytest" is used by a job that runs weekly to test the polymer repos on the upcoming browser versions
# The intent is to get early notice of polymer 1 failing in modern browsers
# the ordering of the canary browser tests is: test beta, then test dev (beta is closer to ready for prod, per http://www.chromium.org/getting-involved/dev-channel

case "$PIPE_NUM" in
"1")
  # "Unit testing" pipeline on codeship

#  if [[ ${CI_BRANCH} != "canarytest" ]]; then
  if [[ ${CI_BRANCH} != "canary-163684472-B" ]]; then
      # quick single browser testing during dev
      printf "\n --- LOCAL UNIT TESTING ---\n\n"
      cp wct.conf.js.local wct.conf.js
      gulp test
      rm wct.conf.js
  fi

  trap logSauceCommands EXIT

  if [[ ${CI_BRANCH} == "production" ]]; then
    printf "\n --- REMOTE UNIT TESTING (prod branch only) ---\n\n"
    # split testing into 2 runs so it doesnt occupy all saucelab resources in one hit
    cp wct.conf.js.remoteA wct.conf.js
    gulp test:remote
    rm wct.conf.js

    sleep 10 # seconds

    cp wct.conf.js.remoteB wct.conf.js
    gulp test:remote
    rm wct.conf.js
  fi

#  if [[ ${CI_BRANCH} == "canarytest" ]]; then
  if [[ ${CI_BRANCH} == "canary-163684472-B" ]]; then
    echo "sleep to give jobs time to run without clashing"
    sleep 180 # seconds = 3 minutes
    echo "awake!"

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- LOCAL WCT CANARY UNIT TESTING ---\n\n"
    cp wct.conf.js.canary wct.conf.js
    gulp test:remote
    rm wct.conf.js
    printf "\n --- WCT unit testing complete---\n\n"

    printf "\n-- Start server in the background, then sleep to give it time to load --"
    nohup bash -c "gulp serve:dist 2>&1 &"
    sleep 40 # seconds
    cat nohup.out

    printf "\n --- Saucelabs Integration Testing ---\n\n"
    cd bin/saucelabs

    printf "\n --- TEST CHROME Beta and Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-beta --tag e2etest


    printf "\n --- start unreliable testing ---\n\n"
    cp wct.conf.js.canary.temp wct.conf.js
    gulp test:remote
    rm wct.conf.js
    printf "\n --- unreliable wct testing complete ---\n\n"

    ./nightwatch.js --env chrome-on-windows-dev --tag e2etest
    printf "\n --- unreliable integration testing complete ---\n\n"
  fi
;;
"2")
  # "Nightwatch" pipeline on codeship

  trap logSauceCommands EXIT

  printf "\n-- Start server in the background, then sleep to give it time to load --"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

#  if [[ ${CI_BRANCH} != "canarytest" ]]; then
  if [[ ${CI_BRANCH} != "canary-163684472-B" ]]; then
      printf "\n --- Local Integration Testing ---\n"

      printf "\n --- Install Selenium ---\n\n"
      curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/selenium_server.sh | bash -s

      cd bin/local

      printf "\n Not testing firefox here atm - selenium would need an upgrade to use a recent enough geckodriver that recent firefox will work - see https://app.codeship.com/projects/131650/builds/34170514 \n\n"

      printf "\n --- TEST CHROME ---\n\n"
      ./nightwatch.js --env chrome --tag e2etest
  fi

#  if [[ ${CI_BRANCH} == "canarytest" ]]; then
  if [[ ${CI_BRANCH} == "canary-163684472-B" ]]; then

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- Saucelabs Integration Testing ---\n\n"
    cd bin/saucelabs

    printf "\n --- TEST FIREFOX Beta and Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-windows-beta,firefox-on-windows-dev --tag e2etest
  fi
;;
"3")
  # "Test commands" pipeline on codeship
  trap logSauceCommands EXIT

  printf "\n-- Start server in the background, then sleep to give it time to load --"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

  printf "\n --- Saucelabs Integration Testing ---\n\n"
  cd bin/saucelabs

  # the env names on the call to nightwatch.js must match the entries in saucelabs/nightwatch.json

#  if [[ ${CI_BRANCH} != "canarytest" ]]; then
  if [[ ${CI_BRANCH} != "canary-163684472-B" ]]; then
      # Win/Chrome is our most used browser, 2018
      # Win/FF is our second most used browser, 2018 - we have the ESR release on Library Desktop SOE

      printf "\n --- TEST popular browsers on WINDOWS ---\n\n"
      ./nightwatch.js --tag e2etest --env default,ie11,firefox-on-windows-esr --tag e2etest
  fi

  if [[ ${CI_BRANCH} == "production" ]]; then
    # Use multiple environments as we have more than 4 browsers to test.
    # This is more than the number of test scripts, so parallelising environments is better
    # than parallelising scripts. Keep to a maximum of 6 browsers so that parallel runs in 
    # other pipelines don't overrun available SauceLabs slots (10).
    printf "\n --- Check all other browsers before going live (prod branch only) ---\n\n"
    ./nightwatch.js --env firefox-on-windows,safari-on-mac,edge,chrome-on-mac,firefox-on-mac,firefox-on-mac-esr --tag e2etest
  fi

#  if [[ ${CI_BRANCH} == "canarytest" ]]; then
  if [[ ${CI_BRANCH} == "canary-163684472-B" ]]; then
    echo "sleep to give jobs time to run without clashing"
    sleep 420 # seconds = 7 minutes
    echo "awake!"

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- TEST CHROME Beta and Dev on MAC (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-mac-beta,chrome-on-mac-dev,firefox-on-mac-beta --tag e2etest

    printf "\n --- start unreliable testing ---\n\n"
    # this one is failing because it never returns on saucelabs
    ./nightwatch.js --env firefox-on-mac-dev --tag e2etest
    printf "\n --- unreliable wct testing complete ---\n\n"
  fi
;;
esac
