# oak
[![release](https://img.shields.io/badge/release-v1.0.0green.svg)](https://github.com/OakLabsInc/oak/releases/tag/1.0.0)
[![node](https://img.shields.io/badge/node-v6.5.0-green.svg)](https://github.com/nodejs/node/releases/tag/v6.5.0)
[![electron](https://img.shields.io/badge/electron-v1.4.15-green.svg)](https://github.com/electron/electron/releases/tag/v1.4.15)
[![Coverage Status](https://coveralls.io/repos/github/OakLabsInc/oak/badge.svg?branch=master&t=zYcBU6)](https://coveralls.io/github/OakLabsInc/oak?branch=master)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-green.svg)](http://standardjs.com/)

A very opinionated kiosk UI application based on [electron](http://electron.atom.io)

## Usage
`oak` inherits from an `EventEmitter`, so when you start your app, you will want to listen for the `ready` event. Next, you want to call `oak.load()` to start a browser. The only hard requirement is a `url` to pass in, this can also be a static HTML file.
```js
const oak = require('oak')

oak.on('ready', function () {
  oak.load({
    url: 'file://path/to/index.html' // or 'http://wwww.mysite.com/' or 'http://localhost:8080/'
  }, function () { 
    // optional callback, when the page has finished and called `ready`
  })
})
```

After that, just run:
```sh
xhost +
docker-compose up --build
```

## Prerequisites
We use docker containers for all our deployment (and most of our development as well). To get started, you will need to have Docker installed, as well as an X server.
`docker-compose` is a utility that easily orchestrates docker containers. This is far easier to manage than typing in single commands every time you want to start a container. An example `docker-compose.yml` is included at the root of this repo.
Make sure you have at least `docker-compose >= 1.8.0` installed.

### Linux
This example is for debian based systems, you can accomplish the same by getting `docker` and `docker-compose` running yourself.
```
# install docker
curl -sSL https://get.docker.com/ | sh

# add your user to the docker group (dont forget to logout and log back in after you do this)
sudo usermod -aG docker $(whoami)

# install latest docker-compose
sudo apt-get install -y python-setuptools
sudo easy_install pip
pip install docker-compose>=1.8.0 docker-py>=1.9.0
```

### OSX and Windows
Install docker from their [website](https://www.docker.com/products/docker)

## Development
You need to allow the X server to give access to outside connections. This is a lot more difficult on Windows and OSX than it is on linux variants.

### Linux
This command will grant access to use your X socket by anyone.
```sh
xhost +
docker-compose up
# you should turn off your open xhost after you are finished developing.
xhost -
```

### OSX
I'm not going to lie... this is a pain in the ass. OSX doesn't have `xorg` or a build in X server by default. You are going to be using `socat` to proxy your Xquartz X socket via TCP, so that you can specify your IP address into the docker container.

1. Make sure to have [homebrew](https://brew.sh/) installed. Visit the site, or use this command in your `Terminal` app:
```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

2. `socat` via [homebrew](https://brew.sh/). This will be needed to forward your X server socket, in order to display a window on your desktop.
```sh
brew install socat
```

3. [XQuartz](https://www.xquartz.org/), which is a X server for OSX.

4. Open XQuartz, go to security and allow incoming connections.

5. Run socat to proxy your X host 
```sh
⁠⁠⁠⁠socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
```

6. In your `docker-compose.yml` replace the `DISPLAY` environment variable with `- DISPLAY=YOURIPADDRESS6:0`. Don't forget the `:0` and the end, that specifys that it's the first display.

7. `docker-compose up`

### Windows
[Cygwin](https://www.cygwin.com/)...?
