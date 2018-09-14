#!/bin/bash -e

OAK_VERSION="4.3.4"
BASE="oaklabs/oak:$OAK_VERSION"

# our FROM line in the Dockerfile, should ideally match the current electron node version
FROM="node"
NODE_VERSION="8.11.3"
ELECTRON_VERSION="1.8.8"
FROM_TAG="$NODE_VERSION-stretch"

NPM_URL="https://registry.npmjs.org/"

DOCKERFILE_TEMPLATE_PATH="./node_modules/.bin/dockerfile-template"

echo ""
echo "* Compiling Dockerfile with $BASE"
echo ""
# compile our template file
$DOCKERFILE_TEMPLATE_PATH \
    -d FROM=$FROM \
    -d FROM_TAG=$FROM_TAG \
    -d ELECTRON_VERSION=$ELECTRON_VERSION > Dockerfile

# build our base tag
echo ""
echo "** Building $BASE"
echo ""

docker build --compress -t $BASE .
docker push $BASE
