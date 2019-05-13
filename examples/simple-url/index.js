const oak = require('oak')
const {KIOSK_URL, OAK_FULLSCREEN, OAK_INSECURE} = process.env

oak.on('ready', () => {
  oak.load({
    url: KIOSK_URL || 'https://www.zivelo.com/',
    fullscreen: OAK_FULLSCREEN || true,
    insecure: OAK_INSECURE || false,
  })
})
