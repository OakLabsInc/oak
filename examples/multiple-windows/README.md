# Multiple Windows

This is an example of spawning multiple windows within one app, and sending messages to and from those windows.

## High level structure

The main server starts, serving up two windows with `oak.load`, pointed at `index.html`

```
        $ npm start ┐
$ docker-compose up ┐
                    │
                    │┌> `let one = oak.load(...)`─> src/one.html
       src/index.js └┤
                      └> `let two = oak.load(...)`─> src/two.html
```

## Messages

Each window sends an event from the `html` page, to eventually fire an event in the other window.

```
one.html
│
└ `oak.send('switch')`
   │
   └─> src/index.js
        │
        └ `two.on('switch', ...)`
        │
        └ `two.send('isFocused')`
        │
        └─> src/two.html
             │
             └ `oak.on('isFocused')`
```
