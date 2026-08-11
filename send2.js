/**
 * Test kirim + tunggu receipt
 * node send2.js
 */
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@yumenative/baileys');
const pino = require('pino');

const AUTH = './.test-auth';
const TO = '6287777668887@s.whatsapp.net';

async function main() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH);
  if (!state.creds.registered) { console.log('Belum reg'); process.exit(1); }

  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version, auth: state,
    browser: Browsers.ubuntu('Chrome'),
    logger: pino({ level: 'info' }),
    printQRInTerminal: false, mobile: true,
  });

  sock.ev.on('creds.update', saveCreds);

  // Log semua event
  sock.ev.on('connection.update', (u) => console.log('[CONN]', JSON.stringify(u)));
  sock.ev.on('messages.upsert', (m) => console.log('[MSG]', JSON.stringify(m)));

  sock.ev.on('connection.update', async (u) => {
    if (u.connection === 'open') {
      console.log('[OK] Connected, sending...');
      try {
        const r = await sock.sendMessage(TO, { text: 'pong ' + Date.now() });
        console.log('[SEND]', JSON.stringify(r?.key));
      } catch(e) {
        console.log('[ERR]', e.message);
      }
      // Tunggu 60 detik biar lihat receipt
      setTimeout(() => { sock.end(); process.exit(0); }, 60000);
    }
  });
}
main().catch(e => console.error(e));
