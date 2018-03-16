# Oak

[![release](https://img.shields.io/badge/release-v4.1.3-green.svg)](https://github.com/OakLabsInc/oak/releases/tag/4.1.3)
[![node](https://img.shields.io/badge/node-v7.9.0-green.svg)](https://github.com/nodejs/node/releases/tag/v7.9.0)
[![electron](https://img.shields.io/badge/electron-v1.7.9-green.svg)](https://github.com/electron/electron/releases/tag/v1.7.9)
[![Coverage Status](https://coveralls.io/repos/github/OakLabsInc/oak/badge.svg?t=zYcBU6)](https://coveralls.io/github/OakLabsInc/oak)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-green.svg)](http://standardjs.com/)

A very opinionated kiosk UI application based on [electron](http://electron.atom.io).

## Rationale

Most of the `electron` project if focused around desktop application development, which is great! But when you are dealing with public computing (ATM machines, airline ticketing, movie theater ticket vendors, etc), you don't really need all the features a traditional desktop application requires. This includes things like drag-n-drop, system menus, desktop icons, etc.

The job of the `oak` module is to give a really easy way to make a kiosk application with modern web technology, so that it's repeatable, scalable, and easy to rapidly prototype for production. It also takes care of a few common Electron work flow issues that aren't immediately apparent, but effect kiosks in a big way. A good example of this would be errors displaying in a dialog window.

## Install

```sh
npm install -g oak
```

### Locally

If you want to use a local version, you can install and execute oak from the `.bin` folder.

```sh
npm install oak
./node_modules/.bin/oak
```

## Quick Start

```text
$ oak --help

  Usage: oak [options] <url>

  If you load oak with a script path, no commandline options will apply automatically.

  Options:
    -h, --help                  output usage information
    -V, --version               output the version number
    -b, --background [String]   Hex background color for initial window. Example: #f0f0f0
    -f, --fullscreen [Boolean]  Set the window to full width and height. This overrides the --size option
    -k, --kiosk [Boolean]       Kiosk mode, which is fullscreen by default. On OSX this will cause the workspace to shift to a whole new one
    -s, --size [String]         Window size in WIDTHxHEIGHT format. Example: 1024x768. This will over ride both --kiosk and --fullscreen
    -x, --x [Number]            Window X position
    -y, --y [Number]            Window Y position
    -t, --title [String]        Window title
    -t, --ontop [Boolean]       Start window ontop of others
    -D, --display [Number]      Display to use
    -S, --shortcut [List]       Register shortcuts, comma separated. reload,quit
    -u, --useragent [String]    User-Agent string
    -F, --frame [Boolean]       Show window frame
    --show [Boolean]            Show window on start
    -n, --node [Boolean]        Enable node integration
    -i, --insecure [Boolean]    Allow insecure connections (not recommended)
    -c, --cache [Boolean]       Use HTTP cache
    -d, --debugger [Boolean]    Open chrome dev tools on load
    --sslExceptions [Array]     Bypass SSL security for specific hosts. This uses a host pattern. Example: *.mysite.com
    --electronVersion           Print electron version
```

You can use any URL you want to simply launch a fullscreen webpage, for example:

```sh
oak http://gifdanceparty.giphy.com/
```

## Making an app

`oak` only requires a couple things to get up and running: A URL, or an `index.js` file. You can specify a path to your module the same way you can with a URL:

```sh
oak path/to/app.js
```

### index.js

The most minimal example, this will launch a fullscreen app, injecting the `oak` object into the client side:

```js
const oak = require('oak')

// when oak is ready, we can tell it to load something
oak.on('ready', () => {
  // loading takes an options object with a `url`, second parameter is an optional callback
  oak.load({
    url: 'http://www.mywebapp.com'
  }) // or callback)
})
```

### `require('oak')`

When you launch your app, the `oak` module is automatically resolved in modules, meaning you don't need to include it in your `package.json` file. This is similar to the way electron exposes it's own modules privately.

### `oak.load(options[, callback])`

Most of these options are wrapping electron.js `BrowserWindow` options, but some are specific to our kiosk use-case. This method returns the `Window` object

* `options`: Object
  * `url`: - Not optional
    * `String` - The `url` option is the only one required, and will load any valid URI

    ```js
    // load a local HTML file
    url: 'file://' + join(__dirname, 'index.html')

    // load your own webserver
    url: 'http://localhost:8080'
    ```

    * `Function` - You can also pass a function to `url`. The first parameter is a callback which you pass your string to. This is helpful for dynamic page loading, redirecting to another page, or simply passing query parameters.

    ```js
    url: function (callback) {
      callback('http://localhost:8080/?time=' + Date.now())
    }
    ```

  * `title`: String `OAK`- The window title
  * `display`: Number `0` - Your display number, and defaults to your main display
  * `fullscreen`: Boolean `true` - Set the window to max height and width
  * `kiosk`: Boolean `false` - Sets kiosk mode
  * `ontop`: Boolean `true` - Set the window to be always on top of others
  * `show`: Boolean `true` - Start the window shown, this will also show the window whenever it is reloaded
  * `size`: String - Window size in WIDTHxHEIGHT format. Example: 1024x768. This will over ride both `kiosk` and `fullscreen`
  * `x`: Number `0` - X position
  * `y`: Number `0` - Y position
  * `shortcut` Object
    * `reload` Boolean `false` - enable CommandOrControl+Shift+R to reload the window
    * `quit` Boolean `false` - enable CommandOrControl+Shift+X to close the app
  * `background`: String `#000000` - Hex color of the window background
  * `frame`: Boolean `false` - Show window frame
  * `scripts`: Array `path` - Local node scripts or modules to load into the `window` during pre-dom phase. This can be a object with `name` and `path` if you want the `window.whatever` script to be named 
  * `flags`: Array - Chrome launch flags to set while starting the window
  * `insecure` Boolean `false` - allow running and displaying insecure content (not recommended at all)
  * `sslExceptions` Array - Bypass SSL security for specific hosts. This uses a host pattern. Example: `*.mysite.com`
  * `cache` Boolean `true` - Enable HTTP cache flag for chrome
  * `userAgent`: String - Defaults to `'Oak/' + oak.version`
  * `callback`: [Function] - Executed when the `ready` function has fired

### Window object

`oak.load()` returns a `Window` object with methods and events. Each instance of `oak.load()` returns a unique object for that window, and the methods are mirrored for both the node side and client (renderer) side.

#### `send(event[, payload])`

Send events to the window

* `event`: String - the event namespace, delimited by `.`
* `payload`: Any - whatever data you want to send along.

    Example: `window.send('myEvent', { foo: 'bar' })`

#### `on(event, callback)`

This is an instance of `EventEmitter2`

* `ready` - Will emit the ready event, and also execute the optional callback
* `reload` - The window has reloaded
  * `oldUrl` - previous URL
  * `newUrl` - new resolved URL
* `location` - A window location change has happened (will not fire if `window.location = X` is called in the rendered)
  * `oldUrl` - previous URL
  * `newUrl` - new resolved URL
  * `oldSession` - previous session ID
  * `newSession` - new session ID
* `loadFailed` - The window load failed
  * `opts`: Object - original options used
  * `err`: Error

#### `location(url)`

Set the URL location of the window. This will fire a `location` event.

* `url`: String - URL to load

#### `reload(cache)`

Reload the window.

* `cache`: Boolean `false` - Reload the window without cache. This will fire a `reload` event.

#### `debug()`

Toggle the chrome debugger

#### `show()`

Show the window

#### `hide()`

Hide the window

#### `focus()`

Set the desktop focus to this window

### Window properties

#### `id`

Unique `id` of that window.

### Window events

The window fires events from electrons [`BrowserWindow`](https://electron.atom.io/docs/api/browser-window/#instance-events) and [`webContents`](https://electron.atom.io/docs/api/web-contents/#instance-events). The only event fired from that set into the renderer is `dom-ready`.

*note*: If you do a `send` of the same event from the renderer side, it will look like the same event coming from electron events. So be careful and watch your namespaces for conflicts!

## Examples

Check out the [examples](https://github.com/OakLabsInc/oak/tree/master/examples) folder!

## Docker

To get started running `oak` in Docker... you will need to have Docker installed. You can install from [here](https://www.docker.com/community-edition#/download), or on Linux systems, run this script:

    ```sh
    curl -sSL https://get.docker.com/ | sh
    # add your user to the docker group
    sudo usermod -aG docker $(whoami)
    ```

You will also need an X server running (`xorg`). If you are on OSX, go ahead and follow the steps below to get setup.

### On Linux
This example is for debian based systems, you can accomplish the same by getting `docker` and `docker-compose` running yourself.

1. Install `python-setuptools`

    ```sh
    sudo apt-get install -y python-setuptools
    ```

2. Install `pip`

    ```sh
    sudo easy_install pip
    ```

3. Install `docker-compose`

    ```sh
    pip install docker-compose>=1.8.0
    ```

4. Allow your `X` server to allow outside connections. Make sure to disable this after you are finished!

    ```sh
    xhost +
    docker-compose up
    ```

    You should turn off your open xhost after you are finished developing.

    ```sh
    docker-compose down
    xhost -
    ```

## On OSX

I'm not going to lie... this is a pain in the ass.

OSX doesn't have `xorg`, or any build in X server by default. You are going to be using `socat` to proxy Xquartz via TCP so that you can use your IP address the docker container. It may be easier to start up a VM running ubuntu or debian.

1. Install [homebrew](https://brew.sh/)

      Homebrew is a easy way to install linux packages on OSX. In your `Terminal` app:

      ```sh
      /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
      ```

2. Install `socat` and `python`

      * `socat` will be needed to forward your X server socket, in order to display a window on your desktop.

        ```sh
        brew install socat
        ```

      * `python` is useful for a number of reasons, but in our case, a means to get `docker-compose`. When you install `python`, you get the `pip` program along with it.

        ```sh
        brew install python
        ```

3. Install `docker-compose`

      Rather than using straight `docker` commands, we use `docker-compose` to simplfy orchestrating multiple containers. `docker-compose` uses a `.yml` file to describe docker commands and run them.

      ```
      pip install docker-compose
      ```

4. Install [XQuartz](https://www.xquartz.org/), which is a X server for OSX.

5. Open XQuartz, go to Preferences > Security > Allow connections from network clients.

6. In `Terminal`, run `socat` to proxy your X server connection via TCP:

      ```sh
      socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
      ```

      After you run this, it will be waiting for connections, so don't close this `Terminal` window.
      ​

7.    Edit `docker-compose.osx.yml`

      Replace the X's with your IP address. This will resolve your `socat` connection to the container, which is proxying XQuartz.

      ```sh
      environment:
        - DISPLAY=XXX.XXX.XXX.XXX:0
      ```

      If your IP address was `192.168.0.5`, the line would be `DISPLAY=192.168.0.5:0` . Don't forget the `:0` and the end, that specifys that it's the first display, not a port.

8. In your `oak` directory, run `docker-compose -f docker-compse.osx.yml up`

## On Windows
Sorry but you are a little on your own as far as an X server goes! In the future we may update this readme to provide info for developing on Windows. In the mean time... [Cygwin](https://www.cygwin.com/)?
