window.foo = function () {
  return 'function foo() executed'
}

window.bar = function () {
  return 'function bar() executed'
}

console.log('from iev_inject.js: I was injected after dom-ready was fired!')

document.getElementById('inject').innerText = 'I was injected after dom-ready was fired!'
