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
    # check /tmp/sc.log presence - it writes to a subdirectory, eg /tmp/wct118915-6262-1w0uwzy.q8it/sc.log
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
if [[ ${CI_BRANCH} == "canarytest" ]]; then
  source ./bin/codeship-testing-canary.sh
  exit 0
fi

case "$PIPE_NUM" in
"1")
  # "Unit testing" pipeline on codeship

  # quick single browser testing during dev
  printf "\n --- LOCAL UNIT TESTING ---\n\n"
  cp wct.conf.js.local wct.conf.js
  gulp test
  rm wct.conf.js

  trap logSauceCommands EXIT

  if [[ ${CI_BRANCH} == "master" ]]; then
    printf "\n --- REMOTE UNIT TESTING (master branch only) ---\n\n"
    # split testing into 2 runs so it doesnt occupy all saucelab resources in one hit
    printf "\ncp wct.conf.js.remoteA wct.conf.js\n"
    cp wct.conf.js.remoteA wct.conf.js
    gulp test:remote
    rm wct.conf.js

    sleep 10 # seconds

    printf "\ncp wct.conf.js.remoteB wct.conf.js\n"
    cp wct.conf.js.remoteB wct.conf.js
    gulp test:remote
    rm wct.conf.js
  fi
;;
"2")
  # "Nightwatch" pipeline on codeship

  trap logSauceCommands EXIT

  printf "\n-- Start server in the background, then sleep to give it time to load --\n"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

  printf "\n --- Saucelabs Integration Testing ---\n\n"
  cd bin/saucelabs

  # the env names on the call to nightwatch.js must match the entries in saucelabs/nightwatch.json
  printf "\n --- TEST popular browsers ---\n\n"
  ./nightwatch.js --tag e2etest --env default --tag e2etest

  if [[ ${CI_BRANCH} == "master" ]]; then
    # Win/Chrome is our most used browser, 2018
    # Win/FF is our second most used browser, 2018 - we have the ESR release on Library Desktop SOE

    printf "\n --- REMOTE UNIT TESTING (master branch only) ---\n\n"
    # This is more than the number of test scripts, so parallelising environments is better
    # than parallelising scripts. Keep to a maximum of 6 browsers so that parallel runs in
    # other pipelines don't overrun available SauceLabs slots (10).
    ./nightwatch.js --tag e2etest --env firefox-on-windows-esr,safari-on-mac,edge,chrome-on-mac --tag e2etest

    ./nightwatch.js --env firefox-on-windows,firefox-on-mac,firefox-on-mac-esr --tag e2etest
  fi
;;
esac
