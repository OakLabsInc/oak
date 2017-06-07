window.foo = function () {
  return 'function foo() executed'
}

window.bar = function () {
  return 'function bar() executed'
}

window.oak.on('dom-ready', function () {
  document.getElementById('inject').innerText = 'I was injected after dom-ready was fired!'
})
