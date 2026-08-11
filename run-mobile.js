/**
 * WhatsApp Mobile — Registrasi + OTP + Dengarkan Pesan Masuk
 *
 *   node run-mobile.js 628xxxxxxxx          → minta kode OTP
 *   node run-mobile.js 628xxxxxxxx 123456   → verifikasi + login + dengar
 *
 * Env: WA_OS=android|ios   WA_DEVICE=samsungs24ultra
 */
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const pino = require("pino");

const AUTH_DIR = path.join(__dirname, ".mobile-auth");
const PHONE = process.argv[2];
const OTP_CODE = process.argv[3];
const METHOD = process.argv[4] || "sms";

if (!PHONE) {
  console.log("Usage: node run-mobile.js <nomor> [kode_otp] [method]");
  process.exit(1);
}

function parsePhone(s) {
  s = s.replace(/\D/g, "");
  const c3 = s.slice(0, 3);
  if (/^(211|212|213|216|218|220|22[1-9]|23[0-9]|24[0-9]|25[0-9]|26[0-9]|290|29[1-9]|35[0-9]|37[0-9]|38[0-9]|42[0-9]|50[0-9]|59[0-9]|67[0-9]|68[0-9]|69[0-9]|85[0-9]|88[0-9]|96[0-9]|97[0-9]|99[0-9])$/.test(c3))
    return { cc: c3, national: String(BigInt(s.slice(3))) };
  const c2 = s.slice(0, 2);
  return { cc: c2, national: String(BigInt(s.slice(2))) };
}

const COUNTRY_META = {
  "1":{mcc:"310",mnc:"410"},"7":{mcc:"250",mnc:"01"},"20":{mcc:"602",mnc:"01"},
  "27":{mcc:"655",mnc:"10"},"30":{mcc:"202",mnc:"01"},"31":{mcc:"204",mnc:"04"},
  "32":{mcc:"206",mnc:"01"},"33":{mcc:"208",mnc:"01"},"34":{mcc:"214",mnc:"01"},
  "36":{mcc:"216",mnc:"01"},"39":{mcc:"222",mnc:"01"},"40":{mcc:"226",mnc:"010"},
  "41":{mcc:"228",mnc:"01"},"43":{mcc:"232",mnc:"01"},"44":{mcc:"234",mnc:"30"},
  "45":{mcc:"238",mnc:"01"},"46":{mcc:"240",mnc:"01"},"47":{mcc:"242",mnc:"01"},
  "48":{mcc:"260",mnc:"01"},"49":{mcc:"262",mnc:"01"},"51":{mcc:"716",mnc:"10"},
  "52":{mcc:"334",mnc:"020"},"54":{mcc:"722",mnc:"310"},"55":{mcc:"724",mnc:"05"},
  "56":{mcc:"730",mnc:"01"},"57":{mcc:"732",mnc:"101"},"58":{mcc:"734",mnc:"04"},
  "60":{mcc:"502",mnc:"12"},"61":{mcc:"505",mnc:"01"},"62":{mcc:"510",mnc:"01"},
  "63":{mcc:"515",mnc:"01"},"64":{mcc:"530",mnc:"01"},"65":{mcc:"525",mnc:"01"},
  "66":{mcc:"520",mnc:"01"},"81":{mcc:"440",mnc:"10"},"82":{mcc:"450",mnc:"05"},
  "84":{mcc:"452",mnc:"01"},"86":{mcc:"460",mnc:"00"},"90":{mcc:"286",mnc:"01"},
  "91":{mcc:"404",mnc:"20"},"92":{mcc:"410",mnc:"01"},"93":{mcc:"412",mnc:"01"},
  "94":{mcc:"413",mnc:"02"},"95":{mcc:"414",mnc:"01"},"98":{mcc:"432",mnc:"11"}
};
function getMeta(cc) { return COUNTRY_META[cc] || { mcc:"000", mnc:"000" }; }

const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, getDeviceConfig } = require("./lib");

function ts() { return new Date().toISOString().slice(11, 19); }

function parseMsg(msg) {
  if (!msg || !msg.message) return "(unknown)";
  const m = msg.message;
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage) return m.extendedTextMessage.text || "";
  if (m.imageMessage) return "[img] " + (m.imageMessage.caption || "");
  if (m.videoMessage) return "[vid] " + (m.videoMessage.caption || "");
  if (m.audioMessage) return "[audio]";
  if (m.stickerMessage) return "[sticker]";
  if (m.documentMessage) return "[doc] " + (m.documentMessage.fileName || "");
  if (m.contactMessage) return "[contact]";
  if (m.locationMessage) return "[loc]";
  if (m.reactionMessage) return "[react: " + (m.reactionMessage.text || "") + "]";
  return JSON.stringify(Object.keys(m));
}
async function main() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const { cc, national } = parsePhone(PHONE);
  const meta = getMeta(cc);
  const device = getDeviceConfig();
  console.log("═══ WhatsApp Mobile Client ═══");
  console.log("  Phone  : +" + cc + " " + national);
  console.log("  Device : " + device.manufacturer + " " + device.model);
  console.log("  OS     : " + device.os + " " + device.osVersion);
  console.log("═══════════════════════════════");

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const registered = state.creds.registered && state.creds.me && state.creds.me.id;

  // MODE 1: Request OTP code
  if (!OTP_CODE) {
    if (!state.creds.registration) {
      state.creds.registration = {
        phoneNumberCountryCode: cc, phoneNumberNationalNumber: national,
        phoneNumberMobileCountryCode: meta.mcc, phoneNumberMobileNetworkCode: meta.mnc, method: METHOD };
      await saveCreds();
    }
    const sock = makeWASocket({ version, auth: state, browser: Browsers.ubuntu("Chrome"),
      logger: pino({ level: "silent" }), printQRInTerminal: false, mobile: true, mcc: meta.mcc, mnc: meta.mnc });
    sock.ev.on("creds.update", () => saveCreds());
    try {
      console.log("\nRequesting " + METHOD.toUpperCase() + " code...");
      const r = await sock.requestRegistrationCode({
        phoneNumberCountryCode: cc, phoneNumberNationalNumber: national,
        phoneNumberMobileCountryCode: meta.mcc, phoneNumberMobileNetworkCode: meta.mnc, method: METHOD });
      console.log(JSON.stringify(r, null, 2));
      if (r.status === "sent" || r.status === "ok") console.log("\nRun: node run-mobile.js " + PHONE + " <CODE>");
    } catch (e) { console.error("Error:", e.reason || e.message); process.exit(1); }
    sock.ws?.close(); return;
  }

  // MODE 2: Verify OTP
  if (!registered) {
    console.log("\nVerifying OTP: " + OTP_CODE + " ...");
    if (!state.creds.registration) {
      state.creds.registration = {
        phoneNumberCountryCode: cc, phoneNumberNationalNumber: national,
        phoneNumberMobileCountryCode: meta.mcc, phoneNumberMobileNetworkCode: meta.mnc, method: METHOD };
      await saveCreds();
    }
    const regSock = makeWASocket({ version, auth: state, browser: Browsers.ubuntu("Chrome"),
      logger: pino({ level: "silent" }), printQRInTerminal: false, mobile: true, mcc: meta.mcc, mnc: meta.mnc });
    regSock.ev.on("creds.update", () => saveCreds());
    try {
      const r = await regSock.register(OTP_CODE.replace(/-/g, ""));
      if (r.status === "ok") { console.log("SUCCESS! JID: " + r.login + "@s.whatsapp.net"); await saveCreds(); }
      else console.log(JSON.stringify(r));
    } catch (e) { console.error("Error:", e.reason || e.message); regSock.ws?.close(); process.exit(1); }
    regSock.ws?.close();
    const { state: fresh } = await useMultiFileAuthState(AUTH_DIR);
    Object.assign(state, fresh);
    if (!state.creds.me?.id) { console.error("No JID after registration"); process.exit(1); }
  }

  // MODE 3: Connect + Listen
  console.log("\nConnecting as " + state.creds.me.id + "...");
  const sock = makeWASocket({ version, auth: state, browser: Browsers.ubuntu("Chrome"),
    logger: pino({ level: "info" }), printQRInTerminal: false, mobile: true, mcc: meta.mcc, mnc: meta.mnc });
  sock.ev.on("creds.update", () => saveCreds());

  sock.ev.on("connection.update", (u) => {
    if (u.connection === "connecting") console.log("[" + ts() + "] Connecting...");
    if (u.connection === "open") { console.log("[" + ts() + "] CONNECTED!\n  !send <no> <msg> | !me | !exit\n"); }
    if (u.connection === "close") {
      const code = u.lastDisconnect?.error?.output?.statusCode;
      console.log("[" + ts() + "] Disconnected code=" + code);
      if (code === 401 || code === 403) { console.log("Logged out"); process.exit(1); }
    }
  });

  sock.ev.on("messages.upsert", ({ messages, type }) => {
    for (const m of messages) {
      if (m.key.fromMe) { if (type === "notify") console.log("[" + ts() + "] SENT → " + m.key.remoteJid + ": " + parseMsg(m)); continue; }
      const from = m.key.remoteJid || m.key.participant || "?";
      console.log("[" + ts() + "] " + from + (m.pushName ? " (" + m.pushName + ")" : "") + ": " + parseMsg(m));
    }
  });

  // Interactive CLI
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });
  rl.prompt();
  rl.on("line", async (line) => {
    line = line.trim(); if (!line) { rl.prompt(); return; }
    const p = line.split(/\s+/);
    if (line === "!exit" || line === "!quit") {
      console.log("[" + ts() + "] Bye!"); rl.close(); await sock.end(); process.exit(0);
    }
    if (line === "!me") { console.log("JID:", state.creds.me?.id, "| Name:", state.creds.me?.name); rl.prompt(); return; }
    if (p[0] === "!send" && p.length >= 3) {
      const jid = p[1].includes("@") ? p[1] : p[1] + "@s.whatsapp.net";
      try { await sock.sendMessage(jid, { text: p.slice(2).join(" ") }); console.log("[" + ts() + "] Sent ✅"); }
      catch (e) { console.error("[" + ts() + "] Send error:", e.message); }
      rl.prompt(); return;
    }
    console.log("Unknown: " + line + " — try !send, !me, !exit");
    rl.prompt();
  });
  process.on("SIGINT", async () => { console.log(""); await sock.end(); process.exit(0); });
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
