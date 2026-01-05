const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  let players = {}

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || !msg.key.remoteJid.endsWith('@g.us')) return

    const text = msg.message.conversation
    const sender = msg.key.participant

    if (text === '!join') {
      players[sender] = { points: 100 }
      await sock.sendMessage(msg.key.remoteJid, { text: '✅ انضم لاعب جديد (100 نقطة)' })
    }

    if (text === '!status') {
      let list = '📊 النقاط:\n'
      for (let p in players) {
        list += `• لاعب: ${players[p].points}\n`
      }
      await sock.sendMessage(msg.key.remoteJid, { text: list })
    }
  })
}

startBot()
