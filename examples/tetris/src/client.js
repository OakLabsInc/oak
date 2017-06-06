let Client = require('oak-tools').client('websocket')

let client = new Client({
  id: 'alexey',
  uri: 'ws://localhost:9999'
})

client.on('ready', function () {
  console.log('* client is connected')
  client
    .on('server.gamestart', function () {
      console.log('the game has started')
    })
    .pub('window.playerStart', {
      name: 'Alexey'
    })
})
