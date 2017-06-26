FROM node:7.4.0-slim

ARG DEBIAN_FRONTEND=noninteractive
ARG NPM_REGISTRY_URL=https://registry.npmjs.org/

WORKDIR /opt/oak
COPY . /opt/oak

RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends \
        apt-utils \
        build-essential \
        dbus-x11 \
        libasound2 \
        libcanberra-gtk-module \
        libcurl3 \
        libexif-dev \
        libgconf-2-4 \
        libgl1-mesa-dri \
        libgl1-mesa-glx \
        libgtk2.0-0 \
        libnotify4 \
        libnss3 \
        libxss1 \
        libxtst6 \
        python \
        udev \
    && mkdir -p /opt/oak/tmp \
    && npm config set registry https://registry.npmjs.org/ \
    && npm install --engine-strict=true --progress=false --progress=false --loglevel="error" \
    && npm link \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /data/oak/app

ONBUILD WORKDIR /data/oak/app
ONBUILD COPY . /data/oak/app
ONBUILD ARG NPM_REGISTRY_URL=https://registry.npmjs.org/
ONBUILD RUN npm config set registry $NPM_REGISTRY_URL \
            && npm i --progress=false --loglevel="error" \
            && npm prune --production --loglevel="error" \
            && npm cache clean \
            && rm -rf ~/.electron \
            && ln -s /data/oak/app/node_modules /node_modules
            
ONBUILD VOLUME /data/oak/app
ONBUILD CMD ["/data/oak/app"]

ENTRYPOINT ["oak"]
CMD ["/opt/oak/examples/simple-script/index.js"]

ENV DISPLAY=:0 \
    DEBUG=false \
    IGNORE_GPU_BLACKLIST=false \
    DISABLE_HTTP_CACHE=false \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    # nvidia card specific env vars
    PATH=/usr/local/nvidia/bin:$PATH \
    LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64
