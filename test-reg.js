/**
 * Test registrasi WhatsApp via wa_old / sms / voice / flash
 * Cara: node test-reg.js <nomor> [method] [otp_code]
 */
const path = require("path");
const fs = require("fs");
const phoneNumber = process.argv[2];
const method = process.argv[3] || "wa_old";
const verifyCode = process.argv[4];

if (!phoneNumber) {
  console.log("Usage: node test-reg.js <nomor_hp> [method] [otp_code]");
  console.log("  method: wa_old (default), sms, voice, flash");
  process.exit(1);
}

const { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require("./lib/Utils");
const { makeWASocket } = require("./lib/Socket");
const pino = require("pino");

function parsePhone(str) {
  const s = String(str).replace(/\D/g, "");
  const threeDig = new Set("211,212,213,216,218,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,260,261,262,263,264,265,266,267,268,269,290,291,297,298,299,350,351,352,353,354,355,356,357,358,359,370,371,372,373,374,375,376,377,378,380,381,382,383,385,386,387,389,420,421,423,500,501,502,503,504,505,506,507,508,509,590,591,592,593,594,595,596,597,598,599,670,672,673,674,675,676,677,678,679,680,681,682,683,685,686,687,688,689,690,691,692,850,852,853,855,856,880,886,960,961,962,963,964,965,966,967,968,970,971,972,973,974,975,976,977,992,993,994,995,996,998".split(","));
  const cc3 = s.slice(0, 3);
  if (threeDig.has(cc3)) return { cc: cc3, national: String(BigInt(s.slice(3))) };
  const cc2 = s.slice(0, 2);
  const twoDig = new Set("20,27,30,31,32,33,34,36,39,40,41,43,44,45,46,47,48,49,51,52,53,54,55,56,57,58,60,61,62,63,64,65,66,81,82,84,86,90,91,92,93,94,95,98".split(","));
  if (twoDig.has(cc2)) return { cc: cc2, national: String(BigInt(s.slice(2))) };
  return { cc: s.slice(0, 1), national: String(BigInt(s.slice(1))) };
}

const COUNTRY_META = { "1":{mcc:"310",mnc:"410"}, "7":{mcc:"250",mnc:"01"}, "20":{mcc:"602",mnc:"01"}, "27":{mcc:"655",mnc:"10"}, "30":{mcc:"202",mnc:"01"}, "31":{mcc:"204",mnc:"04"}, "32":{mcc:"206",mnc:"01"}, "33":{mcc:"208",mnc:"01"}, "34":{mcc:"214",mnc:"01"}, "36":{mcc:"216",mnc:"01"}, "39":{mcc:"222",mnc:"01"}, "40":{mcc:"226",mnc:"010"}, "41":{mcc:"228",mnc:"01"}, "43":{mcc:"232",mnc:"01"}, "44":{mcc:"234",mnc:"30"}, "45":{mcc:"238",mnc:"01"}, "46":{mcc:"240",mnc:"01"}, "47":{mcc:"242",mnc:"01"}, "48":{mcc:"260",mnc:"01"}, "49":{mcc:"262",mnc:"01"}, "51":{mcc:"716",mnc:"10"}, "52":{mcc:"334",mnc:"020"}, "54":{mcc:"722",mnc:"310"}, "55":{mcc:"724",mnc:"05"}, "56":{mcc:"730",mnc:"01"}, "57":{mcc:"732",mnc:"101"}, "58":{mcc:"734",mnc:"04"}, "60":{mcc:"502",mnc:"12"}, "61":{mcc:"505",mnc:"01"}, "62":{mcc:"510",mnc:"01"}, "63":{mcc:"515",mnc:"01"}, "64":{mcc:"530",mnc:"01"}, "65":{mcc:"525",mnc:"01"}, "66":{mcc:"520",mnc:"01"}, "81":{mcc:"440",mnc:"10"}, "82":{mcc:"450",mnc:"05"}, "84":{mcc:"452",mnc:"01"}, "86":{mcc:"460",mnc:"00"}, "90":{mcc:"286",mnc:"01"}, "91":{mcc:"404",mnc:"20"}, "92":{mcc:"410",mnc:"01"}, "93":{mcc:"412",mnc:"01"}, "94":{mcc:"413",mnc:"02"}, "95":{mcc:"414",mnc:"01"}, "98":{mcc:"432",mnc:"11"}, "212":{mcc:"604",mnc:"01"}, "213":{mcc:"603",mnc:"01"}, "216":{mcc:"605",mnc:"02"}, "234":{mcc:"621",mnc:"20"}, "254":{mcc:"639",mnc:"02"}, "255":{mcc:"640",mnc:"02"}, "256":{mcc:"641",mnc:"10"}, "351":{mcc:"268",mnc:"01"}, "353":{mcc:"272",mnc:"01"}, "358":{mcc:"244",mnc:"03"}, "380":{mcc:"255",mnc:"01"}, "420":{mcc:"230",mnc:"01"}, "966":{mcc:"420",mnc:"01"}, "971":{mcc:"424",mnc:"02"}, "972":{mcc:"425",mnc:"01"}, "880":{mcc:"470",mnc:"01"} };
function getMeta(cc) { return COUNTRY_META[cc] || { mcc: "000", mnc: "000" }; }

const AUTH_DIR = path.join(__dirname, ".test-auth");
fs.mkdirSync(AUTH_DIR, { recursive: true });

async function main() {
  const { cc, national } = parsePhone(phoneNumber);
  const meta = getMeta(cc);

  console.log("═══════════════════════════════════════");
  console.log("  WhatsApp Registration Test");
  console.log("═══════════════════════════════════════");
  console.log(`  Phone   : +${cc} ${national}`);
  console.log(`  Method  : ${method}`);
  console.log(`  MCC/MNC : ${meta.mcc}/${meta.mnc}`);
  console.log("═══════════════════════════════════════");

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  if (!state.creds.registration || !state.creds.registration.phoneNumberCountryCode) {
    state.creds.registration = {
      phoneNumberCountryCode: cc,
      phoneNumberNationalNumber: national,
      phoneNumberMobileCountryCode: meta.mcc,
      phoneNumberMobileNetworkCode: meta.mnc,
      method: method,
    };
    await saveCreds();
  }

  const { version } = await fetchLatestBaileysVersion();
  console.log(`  Version : ${version.join(".")}`);

  const sock = makeWASocket({
    version,
    auth: state,
    browser: Browsers.ubuntu("Chrome"),
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    mobile: false,
  });

  sock.ev.on("creds.update", async () => { await saveCreds(); });

  try {
    if (verifyCode) {
      console.log(`\nVerifying code: ${verifyCode} ...`);
      const result = await sock.register(verifyCode);
      console.log("SUCCESS!");
      console.log(JSON.stringify(result, null, 2));
      if (result.login) console.log(`\nRegistered as: ${result.login}@s.whatsapp.net`);
    } else {
      console.log(`\nRequesting ${method.toUpperCase()} code ...`);
      const result = await sock.requestRegistrationCode({
        phoneNumberCountryCode: cc,
        phoneNumberNationalNumber: national,
        phoneNumberMobileCountryCode: meta.mcc,
        phoneNumberMobileNetworkCode: meta.mnc,
        method: method,
      });
      console.log("Code requested!");
      console.log(JSON.stringify(result, null, 2));
      if (result.status === "sent" || result.status === "ok") {
        console.log(`\n${method.toUpperCase()} code sent! Check your phone.`);
        console.log(`\nVerify with: node test-reg.js ${phoneNumber} ${method} <OTP_CODE>`);
      }
      if (result.sms_wait) console.log(`SMS cooldown: ${result.sms_wait}s`);
      if (result.wa_old_wait) console.log(`WA_OLD cooldown: ${result.wa_old_wait}s`);
      if (result.voice_wait) console.log(`Voice cooldown: ${result.voice_wait}s`);
      if (result.flash_wait) console.log(`Flash cooldown: ${result.flash_wait}s`);
    }
  } catch (err) {
    console.error("\nERROR:");
    if (typeof err === "object") {
      console.error("Status:", err.status);
      console.error("Reason:", err.reason);
      console.error(JSON.stringify(err, null, 2));
    } else {
      console.error(err);
    }
    process.exit(1);
  }

  if (sock.ws) sock.ws.close();
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
