const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PasswordEntry = require('../models/PasswordEntry');
const { decrypt, encrypt } = require('../utils/crypto');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function csvEscape(val) {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Export CSV: only encrypted sitePassword values (no plaintext), no caching
router.get('/export/csv', auth, async (req, res) => {
  try {
    const entries = await PasswordEntry.find({ userId: req.user._id });
    res.setHeader('Content-Disposition', `attachment; filename="${req.user.email || req.user._id}-vault.csv"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // CSV header
    const header = ['websiteName', 'siteUsername', 'sitePassword', 'tokenId'];
    res.write(header.join(',') + '\n');

    for (const e of entries) {
      // sitePassword is stored encrypted (iv:tag:enc). Export that encrypted string only.
      const row = [e.websiteName, e.siteUsername, e.sitePassword, e.tokenId || ''];
      res.write(row.map(csvEscape).join(',') + '\n');
    }
    res.end();
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Import CSV: upload file, parse, validate, encrypt if needed, attach to logged-in user
router.post('/import/csv', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const text = req.file.buffer.toString('utf8');
    const records = parse(text, { columns: true, skip_empty_lines: true, trim: true });
    let imported = 0;
    let skipped = 0;
    for (const row of records) {
      try {
        const websiteName = (row.websiteName || row.website || '').trim();
        const siteUsername = (row.siteUsername || row.username || '').trim();
        const sitePasswordRaw = (row.sitePassword || row.password || '').trim();
        const tokenId = (row.tokenId || '').trim() || uuidv4();
        if (!websiteName || !siteUsername || !sitePasswordRaw) {
          skipped++;
          continue;
        }

        // Determine if password appears to already be encrypted (our format: iv:tag:encryptedHex)
        let toStore = sitePasswordRaw;
        const looksEncrypted = typeof sitePasswordRaw === 'string' && sitePasswordRaw.split(':').length === 3;
        if (!looksEncrypted) {
          // encrypt before storing
          toStore = encrypt(sitePasswordRaw);
        }

        // avoid duplicates: same userId + websiteName + siteUsername + tokenId
        const exists = await PasswordEntry.findOne({ userId: req.user._id, websiteName, siteUsername, tokenId });
        if (exists) {
          skipped++;
          continue;
        }

        await PasswordEntry.create({ userId: req.user._id, websiteName, siteUsername, sitePassword: toStore, tokenId });
        imported++;
      } catch (inner) {
        skipped++;
        continue;
      }
    }
    return res.json({ ok: true, imported, skipped });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
