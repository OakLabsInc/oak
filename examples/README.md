# Oak Examples

### Install

```
# in the examples directory
npm install
```

### Run
```
npm start
```

# Examples

## Simple URL

Sometimes you just want a fullscreen webpage in chrome, it can be a pain to automate that! This minimal script will just load a webpage with the default `oak` options, and expose the URI in it's `Dockerfile`

### Quick start
```
docker run --rm -it \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e "KIOSK_URL=http://gifdanceparty.giphy.com/" \
  oaklabs/simple-kiosk
```

## Simple Script

This is the most basic example of loading a local `html` file as the content for a kiosk.

## Multiple Windows

This is an example of spawning multiple windows within one app.

## carousel

Cycle through multiple URLs with a timer.

## Tetris

A simple `hapi.js` based web server, running `oak-tools` server, with a client. The point of this example is to show how simple it can be to include mobile/web clients into your application

