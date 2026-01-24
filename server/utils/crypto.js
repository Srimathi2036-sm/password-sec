const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY || 'default_change_this_key_32bytes!!!!!';

function getKey() {
  // ensure 32 bytes
  return crypto.createHash('sha256').update(String(KEY)).digest();
}

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(enc) {
  try {
    const parts = enc.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const data = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (e) {
    return null;
  }
}

module.exports = { encrypt, decrypt };
