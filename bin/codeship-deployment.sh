#!/bin/bash

# start debugging/tracing commands, -e - exit if command returns error (non-zero status)
set -e

# CI_BRANCH environment variable will be supplied by codeship
if [[ -z $CI_BRANCH ]]; then
  CI_BRANCH=$(git rev-parse --abbrev-ref HEAD)
fi

echo "Deploying branch: ${CI_BRANCH}"

branch=${CI_BRANCH}
src=$(git rev-parse --show-toplevel)
base=$(basename ${src})
dest="${base/uqlibrary-/}"

echo "Install dependencies"
npm install -g gulp-cli bower npm@6
npm install --ignore-scripts
bower install --production

npm rebuild node-sass

pwd
cd ../${base}
pwd

#echo "Check file syntax"
##gulp syntax

echo "Build distribution"
gulp

if [ ${CI_BRANCH} == "production" ]; then
  S3BucketSubDir="${dest}"
  InvalidationPath="/${dest}"
else
  S3BucketSubDir="/${CI_BRANCH}/${dest}"
  InvalidationPath="/${CI_BRANCH}/${dest}"
fi

echo "Deploying to S3 bucket sub-dir: ${S3BucketSubDir}"
echo "Prepare AWS configuration..."

# Use env vars to set AWS config
awsconfigtemp="template.aws.json"
awsconfig="aws.json"

cp $awsconfigtemp $awsconfig

sed -i -e "s#<AWSAccessKeyId>#${AWSAccessKeyId}#g" ${awsconfig}
sed -i -e "s#<AWSSecretKey>#${AWSSecretKey}#g" ${awsconfig}
sed -i -e "s#<S3Bucket>#${S3Bucket}#g" ${awsconfig}
sed -i -e "s#<S3BucketSubDir>#${S3BucketSubDir}#g" ${awsconfig}
sed -i -e "s#<CFDistribution>#${CFDistribution}#g" ${awsconfig}
sed -i -e "s#<AWSRegion>#${AWSRegion}#g" ${awsconfig}

echo "Set all files to absolut paths..."
distFolder=$(ls -d dist/*.html)

absolutePath="//assets.library.uq.edu.au/pages"
if [ ${CI_BRANCH} != "production" ]; then
  absolutePath="//assets.library.uq.edu.au/${CI_BRANCH}/pages"
fi

toReplace=(
  "href=\"manifest.json\""
  "href=\"images/"
  "href=\"styles/"
  "href=\"elements/"
  "src=\"bower_components/"
  "src=\"scripts/"
  "content=\"images/"
  "src=\"images/"
  "manifest=\"/pages/"
  )
replaceWith=(
  "href=\"${absolutePath}/manifest.json\""
  "href=\"${absolutePath}/images/"
  "href=\"${absolutePath}/styles/"
  "href=\"${absolutePath}/elements/"
  "src=\"${absolutePath}/bower_components/"
  "src=\"${absolutePath}/scripts/"
  "content=\"${absolutePath}/images/"
  "src=\"${absolutePath}/images/"
  "manifest=\"${absolutePath}/"
  )

for htmlFile in ${distFolder[@]}; do
  index=0
  for find in ${toReplace[@]}; do
    sed -i -e "s#${find}#${replaceWith[index]}#g" $htmlFile
    index=${index}+1
  done
done

echo "Run gulp task to upload to AWS..."
gulp publish

echo "Run Cloudfront Invalidation: " gulp invalidate --path ${InvalidationPath}
gulp invalidate --path ${InvalidationPath}

echo "Clean up AWS configuration..."
rm -f ${awsconfig}

