// src/utils/helpers.js

const util = require('util');

function timestamp() {
  return new Date().toISOString();
}

function logError(err, context = {}) {
  try {
    const meta = typeof context === 'string' ? { context } : context;
    const message = err && err.message ? err.message : String(err);
    console.error(`[${timestamp()}] [ERROR] ${message}`);
    if (err && err.stack) {
      console.error(err.stack);
    }
    if (Object.keys(meta).length) {
      console.error('[ERROR CONTEXT]', util.inspect(meta, { depth: 3 }));
    }
  } catch (e) {
    // swallow
    console.error('Failed to log error', e);
  }
}

function logInfo(msg, context = {}) {
  try {
    const meta = typeof context === 'string' ? { context } : context;
    console.log(`[${timestamp()}] [INFO] ${msg}`);
    if (Object.keys(meta).length) {
      console.log('[INFO CONTEXT]', util.inspect(meta, { depth: 3 }));
    }
  } catch (e) {
    // swallow
  }
}

function logWarning(msg, context = {}) {
  try {
    const meta = typeof context === 'string' ? { context } : context;
    console.warn(`[${timestamp()}] [WARN] ${msg}`);
    if (Object.keys(meta).length) {
      console.warn('[WARN CONTEXT]', util.inspect(meta, { depth: 3 }));
    }
  } catch (e) {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  logError,
  logInfo,
  logWarning,
  sleep,
  generateRandomString,
  isValidEmail,
  deepClone,
};
