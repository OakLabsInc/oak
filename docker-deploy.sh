#!/bin/bash -e

OAK_VERSION="5.0.0-rc1"
BASE="oaklabs/oak:$OAK_VERSION"

# our FROM line in the Dockerfile, should ideally match the current electron node version
ELECTRON_VERSION="3.0.7"
FROM="node:10.13.0-stretch"

NPM_URL="https://registry.npmjs.org/"

DOCKERFILE_TEMPLATE_PATH="./node_modules/.bin/dockerfile-template"

echo ""
echo "* Compiling Dockerfile with $BASE"
echo ""
# compile our template file
$DOCKERFILE_TEMPLATE_PATH \
    -d FROM=$FROM \
    -d ELECTRON_VERSION=$ELECTRON_VERSION > Dockerfile

# build our base tag
echo ""
echo "** Building $BASE"
echo ""

docker build --compress -t $BASE .
docker push $BASE
