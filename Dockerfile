FROM node:7.4.0-slim

ARG DEBIAN_FRONTEND=noninteractive
ARG NVIDIA=false
ARG NVIDIA_VERSION=367.44

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
        wget \
    && mkdir -p /opt/oak/tmp \
    && npm config set registry https://registry.npmjs.org/ \
    && npm install oak@2.0.0 --global --engine-strict=true --progress=false --loglevel="error" \
    && /bin/bash -c "if [ $NVIDIA == true ]; then\
 apt-get install -y -qq --no-install-recommends module-init-tools binutils &&\
 wget -q -O /tmp/nvidia-driver.run\
 http://us.download.nvidia.com/XFree86/Linux-x86_64/$NVIDIA_VERSION/NVIDIA-Linux-x86_64-$NVIDIA_VERSION.run &&\
 sh /tmp/nvidia-driver.run -a -N --ui=none --no-kernel-module &&\
 rm /tmp/nvidia-driver.run; fi" \
   && apt-get clean \
   && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /data/oak/app

ONBUILD WORKDIR /data/oak/app
ONBUILD COPY . /data/oak/app
ONBUILD RUN npm config set registry http://nexus.oak.host/repository/npm/ \
            && npm i --production=false --engine-strict=true --progress=false --loglevel="error" \
            && npm test \
            && npm prune --production --loglevel="error" \
            && npm cache clean \
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
