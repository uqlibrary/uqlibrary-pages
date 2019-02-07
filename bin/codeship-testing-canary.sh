#!/bin/bash

# this is run from codeship-testing.sh - it cant be run on its own as the varibales are missing

# "canarytest" is used by a job that runs weekly to test the polymer repos on the upcoming browser versions
# The intent is to get early notice of polymer 1 failing in modern browsers
# the ordering of the canary browser tests is: test beta, then test dev (beta is closer to ready for prod, per http://www.chromium.org/getting-involved/dev-channel
# win chrome, win firefox and osx chrome are tested -  other options either dont have canaries or usage is too low to justify

case "$PIPE_NUM" in
"1")
  # "Unit testing" pipeline on codeship

    trap logSauceCommands EXIT

    printf "\nCurrent time : $(date +"%T")\n"
    printf "sleep to give jobs time to run without clashing\n"
    sleep 600 # seconds
    printf "Time of awaken : $(date +"%T")\n\n"

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- LOCAL WCT CANARY UNIT TESTING ---\n\n"
    cp wct.conf.js.canary wct.conf.js
    gulp test:remote
    rm wct.conf.js
    printf "\n --- WCT unit testing complete---\n\n"

    printf "\n-- Start server in the background, then sleep to give it time to load --\n"
    nohup bash -c "gulp serve:dist 2>&1 &"
    sleep 40 # seconds
    cat nohup.out

    printf "\n --- Saucelabs Integration Testing ---\n\n"
    cd bin/saucelabs

    printf "\n --- TEST CHROME Beta and Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-beta --tag e2etest

    # saucelabs currently cant handle win chrome dev (chrome 74) for saucelabs admin reasons
    # the error is: session not created: Chrome version must be between 70 and 73
    # move it to last so we can check everything else passes but still check on this one.
    # when they fix it, replace it in the main wct.conf.js.canary file and delete this block
    # and also add it back into the nightwatch section above

    # OSX firefox dev is also here because it is not appearing in the list of submitted tests
    # and then never returns, causing the job to hang
    printf "\n --- start unreliable testing ---\n\n"
    cp wct.conf.js.canary.temp wct.conf.js
    gulp test:remote
    rm wct.conf.js
    printf "\n --- unreliable wct testing complete ---\n\n"

    ./nightwatch.js --env chrome-on-windows-dev --tag e2etest
    printf "\n --- unreliable integration testing complete ---\n\n"

;;
"2")
  # "Nightwatch" pipeline on codeship

  trap logSauceCommands EXIT

  printf "\n-- Start server in the background, then sleep to give it time to load --\n"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- Saucelabs Integration Testing ---\n\n"
    cd bin/saucelabs

    printf "\n --- TEST FIREFOX Beta and Dev on WINDOWS (canary test) ---\n\n"
    ./nightwatch.js --env firefox-on-windows-beta,firefox-on-windows-dev --tag e2etest
;;
"3")
  # "Test commands" pipeline on codeship
    printf "\nCurrent time : $(date +"%T")\n"
    printf "sleep to give jobs time to run without clashing\n"
    sleep 180 # seconds
    printf "Time of awaken : $(date +"%T")\n\n"

  trap logSauceCommands EXIT

  printf "\n-- Start server in the background, then sleep to give it time to load --\n"
  nohup bash -c "gulp serve:dist 2>&1 &"
  sleep 40 # seconds
  cat nohup.out

  printf "\n --- Saucelabs Integration Testing ---\n\n"
  cd bin/saucelabs

  # the env names on the call to nightwatch.js must match the entries in saucelabs/nightwatch.json

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- TEST Chrome Beta and Dev on MAC (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-mac-beta,chrome-on-mac-dev --tag e2etest
    printf "\n --- wct testing complete ---\n\n"
;;
esac
