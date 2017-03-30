#!/bin/bash -e

BASE="oaklabs/oak:1.2.0"

# our FROM line in the Dockerfile, should ideally match the current electron node version
FROM="node"
FROM_TAG="6.5.0-slim"

ELECTRON="1.4.15"
ELECTRON_REBUILD="1.4.0"

NPM_URL="https://registry.npmjs.org/"

# these will get tagged, by default, as oaklabs/oak:VER-ARCH-nvidia-XXX.XX
NVIDIA_VERSIONS=( "367.44" "375.26" "375.39" "378.13" )

DOCKERFILE_TEMPLATE_PATH="./node_modules/.bin/dockerfile-template"
UNAME_ARCH=$(uname -m)

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
    FROM_TAG="6.5.0-slim";
    ARCH_TAG="amd64";
    ;;
  armv6l)
    FROM="hypriot/rpi-node";
    FROM_TAG="6.5.0-slim";
    ARCH_TAG="arm";
    ;;
  armv7l)
    FROM="hypriot/rpi-node";
    FROM_TAG="6.5.0-slim";
    ARCH_TAG="arm64";
    ;;
esac

FULL_TAG=$BASE-$ARCH_TAG

# Keep track of tags for an optional push arg
TAGS=()
TAGS+=("${FULL_TAG}")

echo "";
echo "* Compiling Dockerfile with $FULL_TAG on Electron v$ELECTRON";
echo "";
# compile our template file
$DOCKERFILE_TEMPLATE_PATH \
    -d FROM=$FROM \
    -d FROM_TAG=$FROM_TAG \
    -d ELECTRON=$ELECTRON \
    -d ELECTRON_REBUILD=$ELECTRON_REBUILD \
    -d NPM_URL=$NPM_URL > Dockerfile;

# build our base tag
echo "";
echo "** Building $FULL_TAG";
echo "";
docker build -t $FULL_TAG $(pwd);

# ./build.sh nvidia will build nvidia version tags
if [[ $# -lt 3 && $1 == "nvidia" ]]; then
    for SPECIFIC_NVIDIA in "${NVIDIA_VERSIONS[@]}"; do
        TAG="${FULL_TAG}-nvidia-${SPECIFIC_NVIDIA}";
        echo "";
        echo "** Building $TAG";
        echo "";
        docker build --build-arg NVIDIA=true --build-arg NVIDIA_VERSION=$SPECIFIC_NVIDIA -t $TAG $(pwd);
        TAGS+=("${TAG}");
    done;
fi

# push our tags array
if [[ $# -lt 3 && ($1 == "push" || $2 == "push") ]]; then
    for TAG in "${TAGS[@]}"; do
        echo "";
        echo "** Pushing $TAG";
        echo "";
        docker push $TAG;
    done;
fi
