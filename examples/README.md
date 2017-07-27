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

```
docker run --rm -it \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e "KIOSK_URL=http://gifdanceparty.giphy.com/" \
  oaklabs/simple-url
```

## Simple Script

This is the most basic example of loading a local `html` file as the content for a kiosk.

## Inject Scripts

An example of how inject local scripts to any URL, we are also using a local html file for this example

## Multiple Windows

This is an example of spawning multiple windows within one app.
