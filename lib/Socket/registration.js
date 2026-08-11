"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileRegisterFetch =
  exports.mobileRegisterEncrypt =
  exports.mobileRegister =
  exports.mobileRegisterExists =
  exports.mobileRegisterCode =
  exports.registrationParams =
  exports.makeRegistrationSocket =
    void 0;
/* eslint-disable camelcase */
const axios_1 = __importDefault(require("axios"));
const Defaults_1 = require("../Defaults");
const crypto_1 = require("../Utils/crypto");
const crypto = require("crypto");
const WABinary_1 = require("../WABinary");
const business_1 = require("./business");
const SIGNATURE_ANDROID =
  "MIIDMjCCAvCgAwIBAgIETCU2pDALBgcqhkjOOAQDBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFDASBgNVBAcTC1NhbnRhIENsYXJhMRYwFAYDVQQKEw1XaGF0c0FwcCBJbmMuMRQwEgYDVQQLEwtFbmdpbmVlcmluZzEUMBIGA1UEAxMLQnJpYW4gQWN0b24wHhcNMTAwNjI1MjMwNzE2WhcNNDQwMjE1MjMwNzE2WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEUMBIGA1UEBxMLU2FudGEgQ2xhcmExFjAUBgNVBAoTDVdoYXRzQXBwIEluYy4xFDASBgNVBAsTC0VuZ2luZWVyaW5nMRQwEgYDVQQDEwtCcmlhbiBBY3RvbjCCAbgwggEsBgcqhkjOOAQBMIIBHwKBgQD9f1OBHXUSKVLfSpwu7OTn9hG3UjzvRADDHj+AtlEmaUVdQCJR+1k9jVj6v8X1ujD2y5tVbNeBO4AdNG/yZmC3a5lQpaSfn+gEexAiwk+7qdf+t8Yb+DtX58aophUPBPuD9tPFHsMCNVQTWhaRMvZ1864rYdcq7/IiAxmd0UgBxwIVAJdgUI8VIwvMspK5gqLrhAvwWBz1AoGBAPfhoIXWmz3ey7yrXDa4V7l5lK+7+jrqgvlXTAs9B4JnUVlXjrrUWU/mcQcQgYC0SRZxI+hMKBYTt88JMozIpuE8FnqLVHyNKOCjrh4rs6Z1kW6jfwv6ITVi8ftiegEkO8yk8b6oUZCJqIPf4VrlnwaSi2ZegHtVJWQBTDv+z0kqA4GFAAKBgQDRGYtLgWh7zyRtQainJfCpiaUbzjJuhMgo4fVWZIvXHaSHBU1t5w//S0lDK2hiqkj8KpMWGywVov9eZxZy37V26dEqr/c2m5qZ0E+ynSu7sqUD7kGx/zeIcGT0H+KAVgkGNQCo5Uc0koLRWYHNtYoIvt5R3X6YZylbPftF/8ayWTALBgcqhkjOOAQDBQADLwAwLAIUAKYCp0d6z4QQdyN74JDfQ2WCyi8CFDUM4CaNB+ceVXdKtOrNTQcc0e+t";
const MD5_CLASSES = "I4gwdeQ1EfhdpmnhU7SGBw==";
const ANDROID_KEY =
  "sdvJhddpcZ+tuNfeaKAEhS+L3M1rg7jC3ka49uKKKbOnggnuN2gUAZLlhItnagVE7d0SPOTPPplfGOowd6240Q==";

// ─── Country metadata: cc → {mcc, mnc, lg, lc} ──────
const COUNTRY_META = {
  '1':{mcc:'310',mnc:'410',lg:'en',lc:'US'},
  '7':{mcc:'250',mnc:'01',lg:'ru',lc:'RU'},
  '20':{mcc:'602',mnc:'01',lg:'ar',lc:'EG'},
  '27':{mcc:'655',mnc:'10',lg:'en',lc:'ZA'},
  '30':{mcc:'202',mnc:'01',lg:'el',lc:'GR'},
  '31':{mcc:'204',mnc:'04',lg:'nl',lc:'NL'},
  '32':{mcc:'206',mnc:'01',lg:'nl',lc:'BE'},
  '33':{mcc:'208',mnc:'01',lg:'fr',lc:'FR'},
  '34':{mcc:'214',mnc:'01',lg:'es',lc:'ES'},
  '36':{mcc:'216',mnc:'01',lg:'hu',lc:'HU'},
  '39':{mcc:'222',mnc:'01',lg:'it',lc:'IT'},
  '40':{mcc:'226',mnc:'010',lg:'ro',lc:'RO'},
  '41':{mcc:'228',mnc:'01',lg:'de',lc:'CH'},
  '43':{mcc:'232',mnc:'01',lg:'de',lc:'AT'},
  '44':{mcc:'234',mnc:'30',lg:'en',lc:'GB'},
  '45':{mcc:'238',mnc:'01',lg:'da',lc:'DK'},
  '46':{mcc:'240',mnc:'01',lg:'sv',lc:'SE'},
  '47':{mcc:'242',mnc:'01',lg:'no',lc:'NO'},
  '48':{mcc:'260',mnc:'01',lg:'pl',lc:'PL'},
  '49':{mcc:'262',mnc:'01',lg:'de',lc:'DE'},
  '51':{mcc:'716',mnc:'10',lg:'es',lc:'PE'},
  '52':{mcc:'334',mnc:'020',lg:'es',lc:'MX'},
  '54':{mcc:'722',mnc:'310',lg:'es',lc:'AR'},
  '55':{mcc:'724',mnc:'05',lg:'pt',lc:'BR'},
  '56':{mcc:'730',mnc:'01',lg:'es',lc:'CL'},
  '57':{mcc:'732',mnc:'101',lg:'es',lc:'CO'},
  '58':{mcc:'734',mnc:'04',lg:'es',lc:'VE'},
  '60':{mcc:'502',mnc:'12',lg:'ms',lc:'MY'},
  '61':{mcc:'505',mnc:'01',lg:'en',lc:'AU'},
  '62':{mcc:'510',mnc:'01',lg:'id',lc:'ID'},
  '63':{mcc:'515',mnc:'01',lg:'en',lc:'PH'},
  '64':{mcc:'530',mnc:'01',lg:'en',lc:'NZ'},
  '65':{mcc:'525',mnc:'01',lg:'en',lc:'SG'},
  '66':{mcc:'520',mnc:'01',lg:'th',lc:'TH'},
  '81':{mcc:'440',mnc:'10',lg:'ja',lc:'JP'},
  '82':{mcc:'450',mnc:'05',lg:'ko',lc:'KR'},
  '84':{mcc:'452',mnc:'01',lg:'vi',lc:'VN'},
  '86':{mcc:'460',mnc:'00',lg:'zh',lc:'CN'},
  '90':{mcc:'286',mnc:'01',lg:'tr',lc:'TR'},
  '91':{mcc:'404',mnc:'20',lg:'en',lc:'IN'},
  '92':{mcc:'410',mnc:'01',lg:'ur',lc:'PK'},
  '93':{mcc:'412',mnc:'01',lg:'fa',lc:'AF'},
  '94':{mcc:'413',mnc:'02',lg:'si',lc:'LK'},
  '95':{mcc:'414',mnc:'01',lg:'my',lc:'MM'},
  '98':{mcc:'432',mnc:'11',lg:'fa',lc:'IR'},
  '212':{mcc:'604',mnc:'01',lg:'ar',lc:'MA'},
  '213':{mcc:'603',mnc:'01',lg:'ar',lc:'DZ'},
  '216':{mcc:'605',mnc:'02',lg:'ar',lc:'TN'},
  '234':{mcc:'621',mnc:'20',lg:'en',lc:'NG'},
  '254':{mcc:'639',mnc:'02',lg:'en',lc:'KE'},
  '255':{mcc:'640',mnc:'02',lg:'sw',lc:'TZ'},
  '256':{mcc:'641',mnc:'10',lg:'en',lc:'UG'},
  '351':{mcc:'268',mnc:'01',lg:'pt',lc:'PT'},
  '353':{mcc:'272',mnc:'01',lg:'en',lc:'IE'},
  '358':{mcc:'244',mnc:'03',lg:'fi',lc:'FI'},
  '380':{mcc:'255',mnc:'01',lg:'uk',lc:'UA'},
  '420':{mcc:'230',mnc:'01',lg:'cs',lc:'CZ'},
  '966':{mcc:'420',mnc:'01',lg:'ar',lc:'SA'},
  '971':{mcc:'424',mnc:'02',lg:'ar',lc:'AE'},
  '972':{mcc:'425',mnc:'01',lg:'he',lc:'IL'},
  '880':{mcc:'470',mnc:'01',lg:'bn',lc:'BD'},
};
function getCountryMeta(cc) {
  return COUNTRY_META[cc] || { mcc: '000', mnc: '000', lg: 'en', lc: 'US' };
}
function urlencode(str) {
  return encodeURIComponent(String(str));
}

function parsePhone(phoneNumber) {
  var str = String(phoneNumber).replace(/\D/g, '');
  var threeDig = new Set(Object.keys(COUNTRY_META).filter(k => k.length === 3));
  ['211','218','220','221','222','223','224','225','226','227','228','229','230','231','232','233','235','236','237','238','239','240','241','242','243','244','245','246','247','248','249','250','251','252','253','257','258','260','261','262','263','264','265','266','267','268','269','290','291','297','298','299','350','352','354','355','356','357','359','370','371','372','373','374','375','376','377','378','381','382','383','385','386','387','389','421','423','500','501','502','503','504','505','506','507','508','509','590','591','592','593','594','595','596','597','598','599','670','672','673','674','675','676','677','678','679','680','681','682','683','685','686','687','688','689','690','691','692','850','852','853','855','856','886','960','961','962','963','964','965','967','968','970','973','974','975','976','977','992','993','994','995','996','998'].forEach(c => threeDig.add(c));
  var cc3 = str.slice(0, 3);
  if (threeDig.has(cc3)) return { cc: cc3, national: String(BigInt(str.slice(3))) };
  var cc2 = str.slice(0, 2);
  var twoDig = new Set(['20','27','30','31','32','33','34','36','39','40','41','43','44','45','46','47','48','49','51','52','53','54','55','56','57','58','60','61','62','63','64','65','66','81','82','84','86','90','91','92','93','94','95','98']);
  for (const cc of Object.keys(COUNTRY_META)) { if (cc.length === 2) twoDig.add(cc); }
  if (twoDig.has(cc2)) return { cc: cc2, national: String(BigInt(str.slice(2))) };
  return { cc: str.slice(0, 1), national: String(BigInt(str.slice(1))) };
}

function _pbVarint(n) { var o=[];var v=BigInt(n);while(v>127n){o.push(Number((v&0x7fn)|0x80n));v>>=7n;}o.push(Number(v));return Buffer.from(o); }
function _pbLenField(f,b) { return Buffer.concat([_pbVarint((f<<3)|2),_pbVarint(b.length),b]); }
function _pbVarintField(f,v) { return Buffer.concat([_pbVarint((f<<3)|0),_pbVarint(v)]); }
function buildVerifiedNameCertificate(identityKeyPublic) {
  if (!identityKeyPublic) return null;
  var serial = crypto.randomBytes(8).readBigUInt64BE(0);
  var details = Buffer.concat([_pbVarintField(1,serial),_pbLenField(2,Buffer.from('smb:wa','utf8')),_pbLenField(4,Buffer.alloc(0))]);
  var sig = crypto_1.Curve.sign(identityKeyPublic, details);
  return Buffer.concat([_pbLenField(1,details),_pbLenField(2,Buffer.from(sig))]).toString('base64url');
}
function buildFormBody(parts, extraPairs) {
  var out = [];
  for (var i = 0; i < parts.length; i += 2) {
    if (parts[i + 1] == null) continue;
    out.push(parts[i] + '=' + urlencode(String(parts[i + 1])));
  }
  if (extraPairs) {
    for (var i = 0; i < extraPairs.length; i += 2) {
      if (extraPairs[i + 1] == null) continue;
      out.push(extraPairs[i] + '=' + urlencode(String(extraPairs[i + 1])));
    }
  }
  return out.join('&');
}


const validRegistrationOptions = (config) =>
  (config === null || config === void 0
    ? void 0
    : config.phoneNumberCountryCode) &&
  config.phoneNumberNationalNumber &&
  config.phoneNumberMobileCountryCode;
const makeRegistrationSocket = (config) => {
  const sock = (0, business_1.makeBusinessSocket)(config);
  const register = async (code) => {
    if (!validRegistrationOptions(config.auth.creds.registration)) {
      throw new Error("please specify the registration options");
    }
    const result = await mobileRegister(
      { ...sock.authState.creds, ...sock.authState.creds.registration, code },
      config.options,
    );
    sock.authState.creds.me = {
      id: (0, WABinary_1.jidEncode)(result.login, "s.whatsapp.net"),
      name: "~",
    };
    sock.authState.creds.registered = true;
    sock.ev.emit("creds.update", sock.authState.creds);
    return result;
  };

  const requestRegistrationCode = async (registrationOptions) => {
    registrationOptions = registrationOptions || config.auth.creds.registration;
    if (!validRegistrationOptions(registrationOptions)) {
      throw new Error("Invalid registration options");
    }
    sock.authState.creds.registration = registrationOptions;
    sock.ev.emit("creds.update", sock.authState.creds);
/*
    const existResult = await mobileRegisterExists(
      { ...config.auth.creds, ...registrationOptions },
      config.options,
    );

    console.log(existResult);

    if (existResult.status !== "ok") {
      throw existResult;
    }
*/
    return mobileRegisterCode(
      { ...config.auth.creds, ...registrationOptions },
      config.options,
    );
  };
  return {
    ...sock,
    register,
    requestRegistrationCode,
  };
};

function getAndroidToken(phoneNumber) {
  const sigDecoded = Buffer.from(SIGNATURE_ANDROID, "base64");
  const clsDecoded = Buffer.from(MD5_CLASSES, "base64");
  const phoneBuffer = Buffer.from(phoneNumber);

  const data = Buffer.concat([sigDecoded, clsDecoded, phoneBuffer]);
  const keyDecoded = Buffer.from(ANDROID_KEY, "base64");

  const opad = Buffer.alloc(64);
  const ipad = Buffer.alloc(64);

  for (let i = 0; i < 64; i++) {
    opad[i] = 0x5c ^ keyDecoded[i];
    ipad[i] = 0x36 ^ keyDecoded[i];
  }

  // subHash = hashlib.sha1(ipad + data)
  const subHash = crypto.createHash("sha1");
  subHash.update(Buffer.concat([ipad, data]));
  const subHashDigest = subHash.digest();

  // hash = hashlib.sha1(opad + subHash.digest())
  const finalHash = crypto.createHash("sha1");
  finalHash.update(Buffer.concat([opad, subHashDigest]));

  // result = base64.b64encode(...)
  return finalHash.digest("base64");
}
exports.makeRegistrationSocket = makeRegistrationSocket;
function convertBufferToUrlHex(buffer) {
  var id = "";
  buffer.forEach((x) => {
    // encode random identity_id buffer as percentage url encoding
    id += `%${x.toString(16).padStart(2, "0").toLowerCase()}`;
  });
  return id;
}
function registrationParams(params) {
  const e_regid = Buffer.alloc(4);
  e_regid.writeInt32BE(params.registrationId);
  const e_skey_id = Buffer.alloc(3);
  e_skey_id.writeInt16BE(params.signedPreKey.keyId);
  params.phoneNumberCountryCode = params.phoneNumberCountryCode
    .replace("+", "")
    .trim();
  params.phoneNumberNationalNumber = params.phoneNumberNationalNumber
    .replace(/[/-\s)(]/g, "")
    .trim();
  // Derive locale from country code, allowing custom overrides
  const meta = getCountryMeta(params.phoneNumberCountryCode);
  const lg = params.lg || params.locale_lang || meta.lg;
  const lc = params.lc || params.locale_country || meta.lc;
  return {
    cc: params.phoneNumberCountryCode,
    in: params.phoneNumberNationalNumber,
    rc: "0",
    lg: lg,
    lc: lc,
    mistyped: params.mistyped || "7",
    authkey: Buffer.from(params.noiseKey.public).toString("base64url"),
    e_regid: e_regid.toString("base64url"),
    e_keytype: "BQ",
    e_ident: Buffer.from(params.signedIdentityKey.public).toString("base64url"),
    e_skey_id: "AAAA",
    e_skey_val: Buffer.from(params.signedPreKey.keyPair.public).toString(
      "base64url",
    ),
    e_skey_sig: Buffer.from(params.signedPreKey.signature).toString(
      "base64url",
    ),
    fdid: params.phoneId,
    network_ratio_type: "1",
    expid: params.deviceId,
    simnum: "1",
    hasinrc: "1",
    pid: Math.floor(Math.random() * 1000).toString(),
    id: convertBufferToUrlHex(params.identityId),
    backup_token: convertBufferToUrlHex(params.backupToken),
    token: getAndroidToken(params.phoneNumberNationalNumber),
    fraud_checkpoint_code: params.captcha,
  };
}
exports.registrationParams = registrationParams;
/**
 * Requests a registration code for the given phone number.
 */
function mobileRegisterCode(params, fetchOptions) {
  const regParams = registrationParams(params);
  const meta = getCountryMeta(params.phoneNumberCountryCode);
  const method = params?.method || "sms";
  const wantsFlash = method === "flash";

  const parts = [
    'cc', regParams.cc,
    'in', regParams.in,
    'rc', regParams.rc,
    'lg', regParams.lg,
    'lc', regParams.lc,
    'authkey', regParams.authkey,
    'e_regid', regParams.e_regid,
    'e_keytype', regParams.e_keytype,
    'e_ident', regParams.e_ident,
    'e_skey_id', regParams.e_skey_id,
    'e_skey_val', regParams.e_skey_val,
    'e_skey_sig', regParams.e_skey_sig,
    'fdid', regParams.fdid,
    'expid', regParams.expid,
    'id', regParams.id,
    'backup_token', regParams.backup_token,
    'token', regParams.token,
    'method', method,
    'sim_mcc', meta.mcc,
    'sim_mnc', meta.mnc,
    'mcc', meta.mcc,
    'mnc', meta.mnc,
    'reason', '',
    'db', '1',
    'sim_type', '1',
    'recaptcha', encodeURIComponent('{\"stage\":\"ABPROP_DISABLED\"}'),
    'network_radio_type', '1',
    'prefer_sms_over_flash', wantsFlash ? 'false' : 'true',
    'simnum', '0',
    'airplane_mode_type', '0',
    'client_metric', encodeURIComponent('{\"attempts\":1,\"app_campaign_download_source\":\"google_play|unknown\",\"was_activated_from_stub\":false}'),
    'mistyped', regParams.mistyped,
    'advertising_id', params.phoneId || '',
    'hasinrc', '1',
    'roaming_type', '0',
    'device_ram', '3.57',
    'education_screen_displayed', 'true',
    'pid', String(Math.floor(Math.random() * 10000)),
    'cellular_strength', String(Math.floor(Math.random() * 5) + 1),
    'tos_version', '5',
    'call_log_permission', wantsFlash ? 'true' : 'false',
    'manage_call_permission', wantsFlash ? 'true' : 'false',
    'clicked_education_link', 'false',
    'aid', '',
    'feo2_query_status', 'error_security_exception',
  ];
  if (params.captcha) { parts.push('fraud_checkpoint_code', params.captcha); }
  const body = buildFormBody(parts, null);
  const enc = mobileRegisterEncrypt(body);
  return mobileRegisterFetch("/code", { encBody: enc, ...fetchOptions });
}
exports.mobileRegisterCode = mobileRegisterCode;
function mobileRegisterExists(params, fetchOptions) {
  return mobileRegisterFetch("/exist", {
    params: {
      ...registrationParams(params),

      // --- SUNTIKAN PARAMETER ANDROID DARI YOWSUP ---
      gpia: "",
      read_phone_permission_granted: "0",
      offline_ab:
        '{"exposure":["android_confluence_tos_pp_link_update_universe|android_confluence_tos_pp_link_update_exp|control"],"metrics":{}}',
      device_ram: "5.59",
      fid: "",
      language_selector_clicked_count: "0",
      language_selector_time_spent: "0",
      roaming_type: "0",
      mistyped: "7", // Timpa mistyped bawaan Baileys (6) jadi 7 ala Yowsup
      feo2_query_status: "error_security_exception",
      sim_num: "0",
      sim_state: "5",
      airplane_mode_type: "0",
      client_metric:
        '{"attempts":28,"app_campaign_download_source":"google-play|unknown","was_activated_from_stub":false}',
      push_token: "",
      device_name: "sagit", // Pura-pura jadi Xiaomi Mi 6
      hasincr: "1",
      backup_token_error: "null_token",
      network_radio_type: "1",
      network_operator_name: "SMART",
      cellular_strength: Math.floor(Math.random() * 5) + 1, // Sinyal random 1-5
      sim_operator_name: "China Mobile",
      pid: "12246",
    },
    ...fetchOptions,
  });
}
exports.mobileRegisterExists = mobileRegisterExists;
/**
 * Registers the phone number on whatsapp with the received OTP code.
 * Now sends encrypted body (ENC=...) instead of plain URL params.
 */
async function mobileRegister(params, fetchOptions) {
  const regParams = registrationParams(params);
  const parts = [
    'cc', regParams.cc,
    'in', regParams.in,
    'rc', regParams.rc,
    'lg', regParams.lg,
    'lc', regParams.lc,
    'authkey', regParams.authkey,
    'e_regid', regParams.e_regid,
    'e_keytype', regParams.e_keytype,
    'e_ident', regParams.e_ident,
    'e_skey_id', regParams.e_skey_id,
    'e_skey_val', regParams.e_skey_val,
    'e_skey_sig', regParams.e_skey_sig,
    'fdid', regParams.fdid,
    'expid', regParams.expid,
    'id', regParams.id,
    'backup_token', regParams.backup_token,
    'token', regParams.token,
    'code', params.code.replace(/-/g, ''),
  ];
  // Add vname for business registration if identityKey is available
  if (params.signedIdentityKey) {
    const vname = buildVerifiedNameCertificate(params.signedIdentityKey.private);
    if (vname) { parts.push('vname', vname); }
  }
  // Add fraud_checkpoint_code if present
  if (params.captcha) { parts.push('fraud_checkpoint_code', params.captcha); }
  const body = buildFormBody(parts, null);
  const enc = mobileRegisterEncrypt(body);
  return mobileRegisterFetch("/register", { encBody: enc, ...fetchOptions });
}
exports.mobileRegister = mobileRegister;
/**
 * Encrypts the given string as AEAD aes-256-gcm with the public whatsapp key and a random keypair.
 */
function mobileRegisterEncrypt(data) {
  const keypair = crypto_1.Curve.generateKeyPair();
  const key = crypto_1.Curve.sharedKey(
    keypair.private,
    Defaults_1.REGISTRATION_PUBLIC_KEY,
  );
  const buffer = (0, crypto_1.aesEncryptGCM)(
    Buffer.from(data),
    new Uint8Array(key),
    Buffer.alloc(12),
    Buffer.alloc(0),
  );
  return Buffer.concat([Buffer.from(keypair.public), buffer]).toString(
    "base64url",
  );
}
exports.mobileRegisterEncrypt = mobileRegisterEncrypt;
async function mobileRegisterFetch(path, opts = {}) {
  let url = `${Defaults_1.MOBILE_REGISTRATION_ENDPOINT}${path}`;
  // Support encrypted body (for /register)
  if (opts.encBody) {
    const data = 'ENC=' + opts.encBody;
    delete opts.encBody;
    delete opts.params;
    if (!opts.headers) opts.headers = {};
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    opts.headers['User-Agent'] = 'WhatsApp/2.26.13.72 Android/11 Device/Xiaomi-sagit';
    opts.method = 'POST';
    opts.data = data;
    const response = await (0, axios_1.default)(url, opts);
    var json = response.data;
    if (response.status > 300 || json.reason) throw json;
    if (json.status && !['ok', 'sent'].includes(json.status)) throw json;
    return json;
  }
  if (opts.params) {
    const parameter = [];
    for (const param in opts.params) {
      if (opts.params[param] !== null && opts.params[param] !== undefined) {
        if (param === "id" || param === "backup_token") {
          parameter.push(param + "=" + opts.params[param]);
        } else {
          parameter.push(param + "=" + urlencode(opts.params[param]));
        }
      }
    }
    url += `?${parameter.join("&")}`;
    delete opts.params;
  }
  if (!opts.headers) {
    opts.headers = {};
  }
  opts.headers["User-Agent"] =
    "WhatsApp/2.26.13.72 Android/11 Device/Xiaomi-sagit";
  const response = await (0, axios_1.default)(url, opts);
  var json = response.data;
  if (response.status > 300 || json.reason) {
    throw json;
  }
  if (json.status && !["ok", "sent"].includes(json.status)) {
    throw json;
  }
  return json;
}
exports.mobileRegisterFetch = mobileRegisterFetch;
