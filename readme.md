# oak
[![release](https://img.shields.io/badge/release-v1.0.0-green.svg)](https://github.com/OakLabsInc/oak/releases/tag/1.0.0)
[![node](https://img.shields.io/badge/node-v6.5.0-green.svg)](https://github.com/nodejs/node/releases/tag/v6.5.0)
[![electron](https://img.shields.io/badge/electron-v1.4.15-green.svg)](https://github.com/electron/electron/releases/tag/v1.4.15)
[![Coverage Status](https://coveralls.io/repos/github/OakLabsInc/oak/badge.svg?branch=master&t=zYcBU6)](https://coveralls.io/github/OakLabsInc/oak?branch=master)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-green.svg)](http://standardjs.com/)

A very opinionated kiosk UI application based on [electron](http://electron.atom.io).

## Rationale
Most of the `electron` project if focused around desktop application development, which is great! But when you are dealing with public computing (ATM machines, airline ticketing, movie theater ticket vendors, etc), you don't really need all the features a traditional desktop application requires.
The job of the `oak` module is to give a really easy way to make a kiosk application with modern web technology, so that it's repeatable, scalable, and easy to rapidly prototype for production.

## Getting Started

`oak` only requires a couple things to get up and running: A URL, and an `index.js` file.

### index.js
The most minimal example, this will launch a fullscreen app, injecting the `oak` object into the client side:
```
const oak = require('oak')

// when oak is ready, we can tell it to load something
oak.on('ready', () => {
  // loading takes an options object with a `url`, second parameter is an optional callback
  oak.load({
    url: 'http://www.mywebapp.com'
  })
})
```

The second parameter of oak.load is an optional callback function, which executes after `oak.ready()` has been fired from the client or `oak.window.ready()` has been called from the server side.

The `url` option is the only one required, and will load any valid URI
```
// load a local HTML file
url: 'file://' + join(__dirname, 'index.html')

// load your own webserver
url: 'http://localhost:8080'
```
### Options
Most of the `oak.load()` options are wrapping electron.js `BrowserWindow` options, but some are specific to our kiosk use-case.
```
// chrome launch flags to set while starting the window
flags: []

// local node modules to load into the `window` during pre-dom phase
modules: [],

// window title
title: 'OAK',

// the default display is your main monitor, if you have more, 
display: 0, 

// window size, which is irrelevant if fullscreen is true
width: 1024, height: 768,

// position of the window
x: 0, y: 0,

// the window background color (when no content is there, or transparent)
background: '#000000',

// launch the app full screen
fullscreen: true,

// always launch ontop of other windows
ontop: true, 

// don't put a frame on the application window
frame: false,

shortcut: {
  // enable CommandOrControl+Shift+R to reload the window
  reload: false,
  // enable CommandOrControl+Shift+X to close the app
  quit: false
},

// start the window shown, otherwise false will start the app hidden, waiting for an explicit `show()` call
show: true,

// allow running and displaying insecure content
insecure: false,

// waits for `oak.message.emit('window.proceed', newUrlString)`
waitForUrl: false
```

If you want to develop and test quickly, you just need to have `oak` installed locally, and `electron` installed globally.
```
 npm i -g electron@1.4.15
 npm i oak
 // execute locally
 ./node_modules/.bin/oak path/to/your/index.js
 // or globally
 npm i -g oak && oak path/to/your/index.js
```

This will not give you a lot of the advantages of a dockerized application however. It's great for rapidly developing locally, but for a production usecase you will want to follow the steps below.

### I don't always test my code, but when I do...

We use docker containers for all our production deployments. To get started, you will need to have Docker installed. You can install docker from their [website](https://www.docker.com/products/docker), or on Linux systems, run this script:

```sh
  curl -sSL https://get.docker.com/ | sh
  # add your user to the docker group
  sudo usermod -aG docker $(whoami)
```

You will also need an X server running (`xorg`). If you are on OSX, go ahead and follow the steps below to get setup.

### On Linux
This example is for debian based systems, you can accomplish the same by getting `docker` and `docker-compose` running yourself.

1. Install `python-setuptools`
   ```
    sudo apt-get install -y python-setuptools
   ```

2. Install `pip`
   ```
    sudo easy_install pip
   ```
3. Install `docker-compose`
   ```
    pip install docker-compose>=1.8.0
   ```

4. Allow your `X` server to allow outside connections. Make sure to disable this after you are finished!
   ```
    xhost +
    docker-compose up

   ```
    You should turn off your open xhost after you are finished developing.
   ```sh
    docker-compose down
    xhost -
   ```

### On OSX
I'm not going to lie... this is a pain in the ass. OSX doesn't have `xorg` or a build in X server by default. You are going to be using `socat` to proxy Xquartz via TCP so that you can use your IP address the docker container. It may be easier to start up a VM running ubuntu or debian.

1.    Install [homebrew](https://brew.sh/)

      Homebrew is a easy way to install linux packages on OSX. In your `Terminal` app:
      ```
      /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
      ```

2.    Install `socat` and `python`

      * `socat` will be needed to forward your X server socket, in order to display a window on your desktop. 
         ```
         brew install socat
         ```
      * `python` is useful for a number of reasons, but in our case, a means to get `docker-compose`. When you install `python`, you get the `pip` program along with it.
        ```
         brew install python
        ```

3.    Install `docker-compose`

      Rather than using straight `docker` commands, we use `docker-compose` to simplfy orchestrating multiple containers. `docker-compose` uses a `.yml` file to describe docker commands and run them.
      ```
      pip install docker-compose
      ```

4.    Install [XQuartz](https://www.xquartz.org/), which is a X server for OSX.
      ​

5.    Open XQuartz, go to Preferences > Security > Allow connections from network clients.
      ​

6.    In `Terminal`, run `socat` to proxy your X server connection via TCP:
      ```
       ⁠⁠⁠⁠socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
      ```

       After you run this, it will be waiting for connections, so don't close this `Terminal` window.
      ​

7.    Edit `docker-compose.osx.yml` 

       Replace the X's with your IP address. This will resolve your `socat` connection to the container, which is proxying XQuartz. 
      ```
      environment:
        - DISPLAY=XXX.XXX.XXX.XXX:0
      ```

      If your IP address was `192.168.0.5`, the line would be `DISPLAY=192.168.0.5:0` . Don't forget the `:0` and the end, that specifys that it's the first display, not a port.

8. In your `oak` directory, run `docker-compose -f docker-compse.osx.yml up`

### On Windows
Sorry but you are a little on your own as far as an X server goes! In the future we may update this readme to provide info for developing on Windows. In the mean time... [Cygwin](https://www.cygwin.com/)?



