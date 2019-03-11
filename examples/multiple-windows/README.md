# Multiple Windows

This is an example of spawning multiple windows within one app, and sending messages to and from those windows.

## High level structure

The main server starts, serving up two windows with `oak.load`, pointed at `index.html`

```
$ npm start ─────┐
$ docker-compose up ─┐
                      │
                      │┌ `let one = oak.load(...)`─ src/index.html
         src/index.js └┤
                        └ `let two = oak.load(...)`─ src/index.html
```

## Messages

Each window sends an event from `index.html`, to eventually fire an event in the other window.

```
* window one - index.html
  oak.send('switch') ────┐
                             │ * window two - index.js
                             └─ two.on('switch', ...)
                             ┌─ two.send('isFocused')
                             │
   * window two - index.html ┘
         oak.on('isFocused')

```
