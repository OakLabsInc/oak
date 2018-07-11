FROM node:8.11.3-stretch

ARG DEBIAN_FRONTEND=noninteractive
ARG NPM_REGISTRY_URL=https://registry.npmjs.org/

WORKDIR /opt/oak
COPY . /opt/oak

RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
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
    libudev-dev \
    libxss1 \
    libxtst6 \
    python \
    udev

RUN npm install --engine-strict=true --progress=false --loglevel="error" \
    && npm test \
    && npm link \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /

ENTRYPOINT ["oak"]
CMD ["--help"]

ENV NODE_ENV=production \
    ELECTRON_VERSION=1.8.7 \
    DISPLAY=:0 \
    DEBUG=false \
    IGNORE_GPU_BLACKLIST=false \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    # nvidia card specific env vars
    PATH=/usr/local/nvidia/bin:$PATH \
    LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64
