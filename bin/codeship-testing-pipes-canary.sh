#!/bin/bash

# this is run from codeship-testing.sh - it cannot be run on its own as the variables are missing

# "canarytest" is used by a job that runs weekly to test the polymer repos on the upcoming browser versions
# The intent is to get early notice of polymer 1 failing in modern browsers
# the ordering of the canary browser tests is: test beta, then test dev (beta is closer to ready for prod, per http://www.chromium.org/getting-involved/dev-channel
# win chrome, win firefox and osx chrome are tested -  other options either dont have canaries or usage is too low to justify

# We are using the pipelines differently for canary tests over regular builds:
# Normally we use them to make the tests run as fast as possible
# This time we are trying to still be able to run tests despite a different browser failing
# There is also a lag in the starts, because the different runs seem to interfere with each other
# Note that speed isnt required here - it runs over the weekend
# We could use just one pipeline, but using all available gives us more flexibility for any codeship restart

case "$PIPE_NUM" in
"1")
  # "Unit testing" pipeline on codeship

    trap logSauceCommands EXIT

    printf "\nCurrent time : $(date +"%T")\n"
    printf "sleep 10 minutes to give other pipelines time to run without clashing\n"
    sleep 600 # seconds
    printf "Time of awaken : $(date +"%T")\n\n"

    printf "Running standard tests against canary versions of the browsers for early diagnosis of polymer failure\n"
    printf "If you get a fail, try it manually in that browser\n\n"

    printf "\n --- WCT CANARY UNIT TESTING ---\n\n"
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

    # the env names on the call to nightwatch.js must match the entries in saucelabs/nightwatch.json
    printf "\n --- TEST CHROME Beta (canary test) ---\n\n"
    ./nightwatch.js --env chrome-on-windows-beta,chrome-on-mac-beta --tag e2etest

    # note: we do not test chrome dev because chromium doesnt allow it.
    # error received: 'This version of ChromeDriver only supports Chrome version 78' (for whatever the latest version is)
    # in theory we could work around this in nightwatch by setting chromedriverVersion to the latest version in the nightwatch.json
    # in practice - it doesnt work, and wouldnt help us with the wct unit tests


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
    # the env names on the call to nightwatch.js must match the entries in saucelabs/nightwatch.json
    ./nightwatch.js --env firefox-on-windows-beta,firefox-on-windows-dev --tag e2etest
;;
esac
