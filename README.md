# Oak

[![release](https://img.shields.io/badge/release-v6.0.1-green.svg)](https://github.com/OakLabsInc/oak/releases/tag/6.0.1)
[![node](https://img.shields.io/badge/node-v12.18.1-green.svg)](https://github.com/nodejs/node/releases/tag/v12.18.1)
[![electron](https://img.shields.io/badge/electron-v6.1.12-green.svg)](https://github.com/electron/electron/releases/tag/v6.1.12)
[![Coverage Status](https://coveralls.io/repos/github/OakLabsInc/oak/badge.svg?t=zYcBU6)](https://coveralls.io/github/OakLabsInc/oak)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-green.svg)](http://standardjs.com/)

A very opinionated kiosk UI application based on [electron](http://electron.atom.io).

## Rationale

Most of the `electron` project if focused around desktop application development, which is great! But when you are dealing with public computing (ATM machines, airline ticketing, movie theater ticket vendors, etc), you don't really need all the features a traditional desktop application requires. This includes things like drag-n-drop, system menus, desktop icons, etc.

The job of the `oak` module is to give a really easy way to make a kiosk application with modern web technology, so that it's repeatable, scalable, and easy to rapidly prototype for production. It also takes care of a few common Electron work flow issues that aren't immediately apparent, but effect kiosks in a big way. A good example of this would be errors displaying in a dialog window.

## Prerequisites

We recommend that you install Nodejs via Node Version Manager: [https://github.com/creationix/nvm#install--update-script](https://github.com/creationix/nvm)

After you install and follow the instructions at the end (adding `nvm` to your path),

```sh
$ nvm install 12.18.1
$ nvm use 12.18.1
```

## Install

The recommended way is to install globally, so it's in your `$PATH`

```sh
$ npm install -g oak
```

If you aren't installing globally, you will have the `oak` entrypoint in your local `node_modules` directory

```sh
$ npm install --save-dev oak # make sure this is saved in your devDependencies
$ node_modules/.bin/oak
```

### Rebuilding native modules

If you are using native node modules, you will generally need to rebuild them to function against the version of node running in `oak`.

```sh
$ cd myApp/
$ npm install
# if you are using oak globally
$ oak-rebuild .
```

if you are using oak in devDependencies

```sh
$ cd myApp/
$ npm install
$ node_modules/.bin/oak-rebuild .
```

#### on Mac OSX

You will need to have the XCode Commandline Tools installed. If you don't, make sure to install XCode and then run:

```sh
$ xcode-select --install
```

## Quick Start

The most minimal example, this will launch a fullscreen app. This will also inject the `oak` object into the client side `window.oak`

```js
// index.js

const oak = require('oak')

// when oak is ready, we can tell it to load something
oak.on('ready', () => {
  // loading takes an options object with a `url`, second parameter is an optional callback
  oak.load({
    url: 'http://www.mywebapp.com'
  }) // or callback)
})
```

```sh
$ oak index.js
```

> When you start your app, the `oak` module is automatically resolved in modules, meaning you don't need to include it in your `package.json` file. This is similar to the way electron exposes it's own modules automatically.

### Load just a URL

You can use any fully qualified URL, to simply launch a fullscreen webpage.

```sh
$ oak http://www.zivelo.com/
```

### Load a file

You can load a single `.html` file as well, but just have a fully qualified path.

```sh
$ oak file://${pwd}/path/to/index.html
```

### Load via JSON

You can also load a `.json` file, which contains the same configuration you would pass to `oak.load()`.

Example: `myOptions.json`

```json
{
  "url": "http://www.zivelo.com",
  "fullscreen": false,
  "ontop": false
}
```

```sh
$ oak myOptions.json
```

### Load via CLI

```text
$ oak --help

Usage: oak [options] [command] <uri>

If you load oak with a script path, no commandline options will apply automatically.

Options:
  -V, --version               output the version number
  -b, --background [String]   Hex background color for initial window. Example: #f0f0f0 (default: "#000000")
  -f, --fullscreen [Boolean]  Set the window to full width and height. This overrides the --size option (default: true)
  -k, --kiosk [Boolean]       Kiosk mode, which is fullscreen by default. On OSX this will cause the workspace to shift to a whole new one (default: false)
  -s, --size [String]         Window size in WIDTHxHEIGHT format. Example: 1024x768. This will over ride both --kiosk and --fullscreen
  -x, --x [Number]            Window X position (default: 0)
  -y, --y [Number]            Window Y position (default: 0)
  -t, --title [String]        Window title (default: "Oak")
  -t, --ontop [Boolean]       Start window ontop of others (default: true)
  -D, --display [Number]      Display to use (default: 0)
  -S, --shortcut [List]       Register shortcuts, comma separated. reload,quit (default: [])
  -u, --useragent [String]    User-Agent string
  -F, --frame [Boolean]       Show window frame (default: false)
  --show [Boolean]            Show window on start (default: true)
  -n, --node [Boolean]        Enable node integration (default: false)
  -i, --insecure [Boolean]    Allow insecure connections (not recommended) (default: false)
  -c, --cache [Boolean]       Use standard caching, setting this to false has the same effect as the --disable-http-cache chrome flag (default: true)
  -d, --debugger [Boolean]    Open chrome dev tools on load (default: false)
  -h, --help                  output usage information

Commands:
  version [options] [type]    Prints version, options are are `all`, `oak`, `electron`, `node`


```

## Methods

### `oak.load(options[, callback])`

Most of these options are wrapping electron.js `BrowserWindow` options, but some are specific to our kiosk use-case. This method returns the `Window` object

* `options`: Object
  * `url`: - Not optional
    * `String` - The `url` option is the only one required, and will load any valid URI

    ```js
    // load a local HTML file
    url: 'file://' + require('path').join(__dirname, 'index.html')

    // load your own webserver
    url: 'http://localhost:8080'
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

#### `oak.getDisplays()`

Returns the current displays, and their metadata. You can use the `id` property to specify a window in `oak.load` properties. An example response:

```js
[
  {
    "id": 0,
    "bounds": {
      "x": 0,
      "y": 0,
      "width": 1920,
      "height": 1080
    },
    "workArea": {
      "x": 0,
      "y": 0,
      "width": 1920,
      "height": 1080
    },
    "size": {
      "width": 1920,
      "height": 1080
    },
    "workAreaSize": {
      "width": 1920,
      "height": 1080
    },
    "scaleFactor": 1,
    "rotation": 0,
    "touchSupport": "unknown"
  }
]
```

#### `oak.sslExceptions`

Bypass SSL security for specific hostnames. This is an array of host patterns, which follow the glob pattern of [minimatch](https://github.com/isaacs/minimatch).

```js
oak.sslExceptions = [
  '*.example.com',
  'subdomain.example.com'
]
```

#### `oak.log`

Returns a [`pino`](https://github.com/pinojs/pino/blob/master/docs/api.md) instance for logging. By default the `DEBUG` environment variable is set to `false`, and will only log messages with the level of `error` or greater.

If you run `DEBUG=true`, you will get anything with a `debug` level or higher, including verbose window information.

### Window object

`oak.load()` returns a `Window` object with methods and events. Each instance of `oak.load()` returns a unique object for that window, and the methods are mirrored for both the node side and client (renderer) side.

#### `.send(event[, payload])`

Send events to the window

* `event`: String - the event namespace, delimited by `.`
* `payload`: Any - whatever data you want to send along.

    Example: `window.send('myEvent', { foo: 'bar' })`

#### `.on(event, callback)`

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
* `unresponsive` - The window has hung and become unresponsive

#### `.location(url)`

Set the URL location of the window. This will fire a `location` event.

* `url`: String - URL to load

#### `.reload(cache)`

Reload the window.

* `cache`: Boolean `false` - Reload the window without cache. This will fire a `reload` event.

#### `.debug()`

Toggle the chrome debugger

#### `.show()`

Show the window

#### `.hide()`

Hide the window

#### `.focus()`

Set the desktop focus to this window

#### `.disableZoom()`

Disables pinch zoom or any window zoom in the browser window

### Window properties

#### `id`

Unique `id` of that window.

### Window events

The window fires events from electrons [`BrowserWindow`](https://electron.atom.io/docs/api/browser-window/#instance-events) and [`webContents`](https://electron.atom.io/docs/api/web-contents/#instance-events). The only event fired from that set into the renderer is `dom-ready`.

*note*: If you do a `send` of the same event from the renderer side, it will look like the same event coming from electron events. So be careful and watch your namespaces for conflicts!

### Environment variables

If you would like to use 

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
