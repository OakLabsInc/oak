#!/bin/bash -e

OAK_VERSION="2.1.2";
BASE="oaklabs/oak:$OAK_VERSION";

# our FROM line in the Dockerfile, should ideally match the current electron node version
FROM="node";
NODE_VERSION="7.4.0";
FROM_TAG="$NODE_VERSION-slim";

NPM_URL="https://registry.npmjs.org/";

DOCKERFILE_TEMPLATE_PATH="./node_modules/.bin/dockerfile-template";
MANIFEST_TOOL_PATH="/usr/bin/manifest-tool";

UNAME_ARCH=$(uname -m);

if [[ $# -lt 3 && $1 == "manifest" ]]; then
    if [ ! -e "$DOCKERFILE_TEMPLATE_PATH" ]; then
        echo "";
        echo "* manifest-tool missing. Install it so you can use it!.";
        echo "";
        exit 1;
    else
        $MANIFEST_TOOL_PATH push from-spec manifest.yml
        echo "";
        echo "* manifest pushed successfully.";
        exit 0;
    fi
fi

if [ ! -e "$DOCKERFILE_TEMPLATE_PATH" ]; then
  echo "";
  echo "* dockerfile-template missing. Attempting to install now.";
  echo "";
  npm i dockerfile-template;
fi

# The immediate targets are just for intel and arm (raspi)
case $UNAME_ARCH in
  x86_64)
    FROM="node";
    ARCH_TAG="amd64";
    ;;
  armv6l)
    FROM="hypriot/rpi-node";
    ARCH_TAG="arm";
    ;;
  armv7l)
    FROM="hypriot/rpi-node";
    ARCH_TAG="arm64";
    ;;
esac

FULL_TAG=$BASE-$ARCH_TAG

# Keep track of tags for an optional push arg
TAGS=()
TAGS+=("${FULL_TAG}")

echo "";
echo "* Compiling Dockerfile with $FULL_TAG";
echo "";
# compile our template file
$DOCKERFILE_TEMPLATE_PATH \
    -d FROM=$FROM \
    -d FROM_TAG=$FROM_TAG \
    -d OAK_VERSION=$OAK_VERSION \
    -d NPM_URL=$NPM_URL > Dockerfile;

# build our base tag
echo "";
echo "** Building $FULL_TAG";
echo "";
docker build -t $FULL_TAG $(pwd);

# push our tags array
if [[ $# -lt 3 && $1 == "push" ]]; then
    for TAG in "${TAGS[@]}"; do
        echo "";
        echo "** Pushing $TAG";
        echo "";
        docker push $TAG;
    done;
fi
