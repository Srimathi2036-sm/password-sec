const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const base64url = (buf) => Buffer.from(buf).toString('base64url');
const User = require('../models/User');

// generate registration options
router.post('/register/options', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const challenge = crypto.randomBytes(32).toString('base64url');
  user.webauthnChallenge = challenge;
  await user.save();
  const options = {
    challenge,
    rp: { name: 'SecurePass' },
    user: { id: base64url(user._id.toString()), name: user.email, displayName: user.username },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    authenticatorSelection: { userVerification: 'preferred' },
    timeout: 60000,
  };
  res.json(options);
});

// verify registration response (lightweight: store credential id)
router.post('/register/verify', async (req, res) => {
  const { email, id } = req.body;
  if (!email || !id) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  // store credential id
  user.webauthn = { credentialId: id, publicKey: '' };
  user.webauthnChallenge = undefined;
  await user.save();
  res.json({ ok: true });
});

// generate assertion options
router.post('/assert/options', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await User.findOne({ email });
  if (!user || !user.webauthn?.credentialId) return res.status(404).json({ error: 'User or credential not found' });
  const challenge = crypto.randomBytes(32).toString('base64url');
  user.webauthnChallenge = challenge;
  await user.save();
  const options = {
    challenge,
    allowCredentials: [{ id: user.webauthn.credentialId, type: 'public-key' }],
    timeout: 60000,
    userVerification: 'preferred',
  };
  res.json(options);
});

// verify assertion (lightweight: accept if credentialId matches)
router.post('/assert/verify', async (req, res) => {
  const { email, id } = req.body;
  if (!email || !id) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.findOne({ email });
  if (!user || !user.webauthn?.credentialId) return res.status(404).json({ error: 'User or credential not found' });
  if (user.webauthn.credentialId !== id) return res.status(400).json({ error: 'Credential mismatch' });
  // on success, issue JWT
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'change_this_jwt_secret', { expiresIn: '12h' });
  res.json({ ok: true, token, user: { id: user._id, username: user.username, email: user.email } });
});

module.exports = router;
