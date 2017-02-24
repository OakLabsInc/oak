FROM node:6.5.0-slim

ARG DEBIAN_FRONTEND=noninteractive
ARG NVIDIA=false
ARG NVIDIA_VERSION=367.44

WORKDIR /opt/oak
COPY . /opt/oak

RUN echo deb http://httpredir.debian.org/debian jessie-backports main contrib non-free >> /etc/apt/sources.list.d/repo.list \
    && apt-get update -q && apt-get install -t jessie-backports -y -qq --no-install-recommends \
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
    wget \
    && mkdir -p /opt/oak/tmp \
    && npm config set registry https://registry.npmjs.org/ \
    && npm install --production=false --engine-strict=true --progress=false --loglevel="error" \
    && npm test \
    && npm prune --production --loglevel="error" \
    && npm install -g electron@1.4.15 electron-rebuild@1.4.0 --exact --loglevel "error" \
    && electron-rebuild -p -v 1.4.15 -m /opt/oak/node_modules \
    && npm link --progress=false --loglevel="error" \
    && npm link oak  --progress=false --loglevel="error" \
    && /bin/bash -c "if [ $NVIDIA == true ]; then\
 apt-get install -y -qq --no-install-recommends module-init-tools binutils &&\
 wget -q -O /tmp/nvidia-driver.run\
 http://us.download.nvidia.com/XFree86/Linux-x86_64/$NVIDIA_VERSION/NVIDIA-Linux-x86_64-$NVIDIA_VERSION.run &&\
 sh /tmp/nvidia-driver.run -a -N --ui=none --no-kernel-module &&\
 rm /tmp/nvidia-driver.run; fi" \
   && npm cache clean \
   && apt-get clean \
   && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /data/oak/app

ONBUILD WORKDIR /data/oak/app
ONBUILD COPY . /data/oak/app
ONBUILD RUN npm config set registry http://nexus.oak.host/repository/npm/ \
            && npm i --production=false --engine-strict=true --progress=false --loglevel="error" \
            && electron-rebuild -p -v 1.4.15 -m /data/oak/app/node_modules \
            && npm test \
            && npm prune --production --loglevel="error" \
            && npm link oak \
            && npm cache clean \
            && ln -s /data/oak/app/node_modules /node_modules \
            && rm -rf ~/.electron
            
ONBUILD VOLUME /data/oak/app
ONBUILD CMD ["/data/oak/app"]

ENTRYPOINT ["oak"]
CMD ["/opt/oak/default"]

ENV DISPLAY=:0 \
    DEBUG=false \
    IGNORE_GPU_BLACKLIST=false \
    DISABLE_HTTP_CACHE=false \
    NODE_TLS_REJECT_UNAUTHORIZED=0
