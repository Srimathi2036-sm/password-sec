const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PasswordEntry = require('../models/PasswordEntry');
const { encrypt, decrypt } = require('../utils/crypto');
const { v4: uuidv4 } = require('uuid');

// create entry
router.post('/', auth, async (req, res) => {
  const { websiteName, siteUsername, sitePassword } = req.body;
  if (!websiteName || !siteUsername || !sitePassword) return res.status(400).json({ error: 'Missing fields' });
  try {
    const tokenId = uuidv4();
    const enc = encrypt(sitePassword);
    const entry = new PasswordEntry({ userId: req.user._id, websiteName, siteUsername, sitePassword: enc, tokenId });
    await entry.save();
    return res.json({ ok: true, entry: { id: entry._id, websiteName, siteUsername, tokenId } });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// list entries
router.get('/', auth, async (req, res) => {
  try {
    const entries = await PasswordEntry.find({ userId: req.user._id }).select('-sitePassword');
    return res.json({ entries });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// get single with decrypted password
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await PasswordEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    const decrypted = decrypt(entry.sitePassword);
    return res.json({ entry: { id: entry._id, websiteName: entry.websiteName, siteUsername: entry.siteUsername, sitePassword: decrypted, tokenId: entry.tokenId } });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// update entry
router.put('/:id', auth, async (req, res) => {
  const { websiteName, siteUsername, sitePassword } = req.body;
  try {
    const entry = await PasswordEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (websiteName) entry.websiteName = websiteName;
    if (siteUsername) entry.siteUsername = siteUsername;
    if (sitePassword) entry.sitePassword = encrypt(sitePassword);
    await entry.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await PasswordEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
