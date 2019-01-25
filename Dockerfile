FROM node:10.14.2-stretch

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /opt/oak

RUN apt-get update -q && apt-get install -y -q --no-install-recommends \
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
    libgtk3.0 \
    libnotify4 \
    libnss3 \
    libusb-1.0-0 \
    libusb-1.0.0-dev \
    libxss1 \
    libxtst6 \
    libxcursor1 \
    python

COPY . /opt/oak

RUN npm install --engine-strict=true \
    && npm link \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.electron

ENTRYPOINT ["oak"]

ENV npm_config_target=3.0.11 \
    npm_config_runtime=electron \
    npm_config_arch=x64 \
    npm_config_target_arch=x64 \
    npm_config_disturl=https://atom.io/download/electron \
    NODE_ENV=production \
    ELECTRON_VERSION=3.0.11 \
    DISPLAY=:0 \
    IGNORE_GPU_BLACKLIST=false \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    # nvidia card specific env vars
    PATH=/usr/local/nvidia/bin:$PATH \
    LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64
