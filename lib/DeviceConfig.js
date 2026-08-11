'use strict';

// ─── Device profiles ────────────────────────────────────────────────────────
// Set WA_OS=ios|android and WA_DEVICE=<key> in .env to select one.
// Individual WA_DEVICE_* vars build a custom profile.

const PLATFORM = {
  ANDROID: 0, IOS: 1, WINDOWS_PHONE: 2, BLACKBERRY: 3,
  WEB: 14, ANDROID_BUSINESS: 17, IOS_BUSINESS: 18,
};

// ─── iOS device profiles ───────────────────────────────────────────────────
const IOS_DEVICE_PROFILES = {
  'iphone15pro':  { os:'ios',platform:PLATFORM.IOS,model:'iPhone 15 Pro',manufacturer:'Apple',osVersion:'17.4.1',osBuildNumber:'21E236',modelId:'iPhone16,1',deviceModelType:2 },
  'iphone15':     { os:'ios',platform:PLATFORM.IOS,model:'iPhone 15',manufacturer:'Apple',osVersion:'17.4.1',osBuildNumber:'21E236',modelId:'iPhone15,4',deviceModelType:2 },
  'iphone14':     { os:'ios',platform:PLATFORM.IOS,model:'iPhone 14',manufacturer:'Apple',osVersion:'17.4.1',osBuildNumber:'21E236',modelId:'iPhone14,2',deviceModelType:2 },
  'iphone14pro':  { os:'ios',platform:PLATFORM.IOS,model:'iPhone 14 Pro',manufacturer:'Apple',osVersion:'17.4.1',osBuildNumber:'21E236',modelId:'iPhone15,2',deviceModelType:2 },
  'iphone13':     { os:'ios',platform:PLATFORM.IOS,model:'iPhone 13',manufacturer:'Apple',osVersion:'16.7.8',osBuildNumber:'20H343',modelId:'iPhone14,5',deviceModelType:2 },
  'iphone12':     { os:'ios',platform:PLATFORM.IOS,model:'iPhone 12',manufacturer:'Apple',osVersion:'15.8.3',osBuildNumber:'19H384',modelId:'iPhone13,2',deviceModelType:1 },
};

// ─── Android device profiles ───────────────────────────────────────────────
const ANDROID_DEVICE_PROFILES = {
  'samsungs24ultra':  { os:'android',platform:PLATFORM.ANDROID,model:'Samsung Galaxy S24 Ultra',manufacturer:'Samsung',osVersion:'14',osBuildNumber:'UP1A.231005.007',modelId:'SM-S928B',deviceModelType:2 },
  'samsungs24':       { os:'android',platform:PLATFORM.ANDROID,model:'Samsung Galaxy S24',manufacturer:'Samsung',osVersion:'14',osBuildNumber:'UP1A.231005.007',modelId:'SM-S921B',deviceModelType:2 },
  'samsungs23':       { os:'android',platform:PLATFORM.ANDROID,model:'Samsung Galaxy S23',manufacturer:'Samsung',osVersion:'14',osBuildNumber:'UP1A.231005.007',modelId:'SM-S911B',deviceModelType:2 },
  'samsungs23ultra':  { os:'android',platform:PLATFORM.ANDROID,model:'Samsung Galaxy S23 Ultra',manufacturer:'Samsung',osVersion:'14',osBuildNumber:'UP1A.231005.007',modelId:'SM-S918B',deviceModelType:2 },
  'pixel8pro':        { os:'android',platform:PLATFORM.ANDROID,model:'Pixel 8 Pro',manufacturer:'Google',osVersion:'14',osBuildNumber:'UQ1A.240105.004',modelId:'GC3VE',deviceModelType:2 },
  'pixel8':           { os:'android',platform:PLATFORM.ANDROID,model:'Pixel 8',manufacturer:'Google',osVersion:'14',osBuildNumber:'UQ1A.240105.004',modelId:'GKWS6',deviceModelType:2 },
  'xiaomisagit':      { os:'android',platform:PLATFORM.ANDROID,model:'Xiaomi Mi 6',manufacturer:'Xiaomi',osVersion:'11',osBuildNumber:'11.0.0',modelId:'sagit',deviceModelType:1 },
};

const IOS_DEVICE = { os:'ios',platform:PLATFORM.IOS,model:'iPhone 15 Pro',manufacturer:'Apple',osVersion:'17.4.1',osBuildNumber:'21E236',modelId:'iPhone16,1',deviceModelType:2 };
const ANDROID_DEVICE = { os:'android',platform:PLATFORM.ANDROID,model:'Samsung Galaxy S24 Ultra',manufacturer:'Samsung',osVersion:'14',osBuildNumber:'UP1A.231005.007',modelId:'SM-S928B',deviceModelType:2 };

function _normalise(s) { return String(s).toLowerCase().replace(/[\s_-]/g, ''); }

const _IOS_MAP = {}, _ANDROID_MAP = {};
for (const k of Object.keys(IOS_DEVICE_PROFILES)) _IOS_MAP[_normalise(k)] = IOS_DEVICE_PROFILES[k];
for (const k of Object.keys(ANDROID_DEVICE_PROFILES)) _ANDROID_MAP[_normalise(k)] = ANDROID_DEVICE_PROFILES[k];

function _wantsBusiness() {
  const v = String(process.env.WA_BUSINESS || '').toLowerCase().trim();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function getDeviceConfig() {
  const osType = (process.env.WA_OS || 'android').toLowerCase().trim();
  const business = _wantsBusiness();
  if (osType === 'android') {
    const profileKey = _normalise(process.env.WA_DEVICE || 'samsungs24ultra');
    const found = _ANDROID_MAP[profileKey] || null;
    if (found) return Object.assign({}, found, business ? { business: true, platform: PLATFORM.ANDROID_BUSINESS } : { business: false });
    return { os:'android',business,platform:business?PLATFORM.ANDROID_BUSINESS:PLATFORM.ANDROID,model:process.env.WA_DEVICE_MODEL||ANDROID_DEVICE.model,manufacturer:process.env.WA_DEVICE_MANUFACTURER||ANDROID_DEVICE.manufacturer,osVersion:process.env.WA_DEVICE_OS_VERSION||ANDROID_DEVICE.osVersion,osBuildNumber:process.env.WA_DEVICE_BUILD||ANDROID_DEVICE.osBuildNumber,modelId:process.env.WA_DEVICE_MODEL_ID||ANDROID_DEVICE.modelId,deviceModelType:ANDROID_DEVICE.deviceModelType };
  }
  const profileKey = _normalise(process.env.WA_DEVICE || 'iphone15pro');
  const found = _IOS_MAP[profileKey] || null;
  if (found) return Object.assign({}, found, business ? { business: true, platform: PLATFORM.IOS_BUSINESS } : { business: false });
  return { os:'ios',business,platform:business?PLATFORM.IOS_BUSINESS:PLATFORM.IOS,model:process.env.WA_DEVICE_MODEL||IOS_DEVICE.model,manufacturer:process.env.WA_DEVICE_MANUFACTURER||IOS_DEVICE.manufacturer,osVersion:process.env.WA_DEVICE_OS_VERSION||IOS_DEVICE.osVersion,osBuildNumber:process.env.WA_DEVICE_BUILD||IOS_DEVICE.osBuildNumber,modelId:process.env.WA_DEVICE_MODEL_ID||IOS_DEVICE.modelId,deviceModelType:IOS_DEVICE.deviceModelType };
}

module.exports = { getDeviceConfig, PLATFORM, IOS_DEVICE_PROFILES, ANDROID_DEVICE_PROFILES, IOS_DEVICE, ANDROID_DEVICE };
