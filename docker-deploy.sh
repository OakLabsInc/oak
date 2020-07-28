#!/bin/bash -e

OAK_VERSION="7.0.0"
BASE="oaklabs/oak"

# our FROM line in the Dockerfile, should ideally match the current electron node version
ELECTRON_VERSION="7.3.2"
FROM="node:12.18.3-stretch"

NPM_URL="https://registry.npmjs.org/"

DOCKERFILE_TEMPLATE_PATH="./node_modules/.bin/dockerfile-template"

echo ""
echo "* Compiling Dockerfile with $BASE:$OAK_VERSION"
echo ""
# compile our template file
$DOCKERFILE_TEMPLATE_PATH \
    -d FROM=$FROM \
    -d ELECTRON_VERSION=$ELECTRON_VERSION > Dockerfile

# build our base tag
echo ""
echo "** Building $BASE:$OAK_VERSION"
echo ""

docker build --compress -t $BASE:$OAK_VERSION .
# docker tag $BASE:$OAK_VERSION $BASE:latest

docker push $BASE:$OAK_VERSION
# docker push $BASE:latest