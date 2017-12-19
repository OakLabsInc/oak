#!/bin/bash -e

VERSION=$(node bin/entrypoint --version)
ELECTRON_VERSION=$(./node_modules/.bin/electron -v - | sed -r s/v//)

npm t;
rm -rf ./build/*;

exec electron-packager $PWD/ \
  --app-version=$VERSION \
  --build-version=$VERSION \
  --asar \
  --platform=linux \
  --electron-version=$ELECTRON_VERSION \
  --out $PWD/build
