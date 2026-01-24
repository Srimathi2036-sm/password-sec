const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordEntry = require('../models/PasswordEntry');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_jwt_secret';
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT || '10', 10);

// transporter (console / ethereal fallback)
async function getTransporter() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport({ url: process.env.SMTP_URL });
  }
  // fallback: ethereal
  const test = await nodemailer.createTestAccount();
  return nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, auth: { user: test.user, pass: test.pass } });
}

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, BCRYPT_SALT);
    const user = new User({ username, email, password: hash });
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    // if MFA enabled, expect OTP verification prior to issuing token
    if (user.mfaEnabled) {
      if (!otp || otp !== user._mfaTemp) return res.status(401).json({ error: 'OTP required/invalid' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, user: { id: user._id, username: user.username, email: user.email, mfaEnabled: user.mfaEnabled, biometricEnabled: user.biometricEnabled, emergencyContacts: user.emergencyContacts } });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();
    const transporter = await getTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const info = await transporter.sendMail({ from: 'no-reply@securepass.local', to: email, subject: 'Password reset', text: `Reset link: ${resetUrl}` });
    // return preview url if ethereal
    const data = { ok: true };
    if (nodemailer.getTestMessageUrl(info)) data.preview = nodemailer.getTestMessageUrl(info);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email, resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.password = await bcrypt.hash(password, BCRYPT_SALT);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/change-password', async (req, res) => {
  const { email, current, next } = req.body;
  if (!email || !current || !next) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(current, user.password);
    if (!ok) return res.status(400).json({ error: 'Current password incorrect' });
    user.password = await bcrypt.hash(next, BCRYPT_SALT);
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/update-emergency', async (req, res) => {
  const { email, emergencyContacts } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  if (!Array.isArray(emergencyContacts)) return res.status(400).json({ error: 'emergencyContacts must be an array' });
  // Validate each contact
  for (const contact of emergencyContacts) {
    if (!contact.name || !contact.phone) return res.status(400).json({ error: 'Each contact must have name and phone' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.emergencyContacts = emergencyContacts;
    await user.save();
    return res.json({ ok: true, emergencyContacts: user.emergencyContacts });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      mfaEnabled: user.mfaEnabled,
      biometricEnabled: user.biometricEnabled,
      emergencyContacts: user.emergencyContacts
    });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/delete-account', async (req, res) => {
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await PasswordEntry.deleteMany({ userId: user._id });
    await user.remove();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// basic enable/disable flags
router.post('/update-flags', async (req, res) => {
  const { email, mfaEnabled, biometricEnabled } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (typeof mfaEnabled === 'boolean') user.mfaEnabled = mfaEnabled;
    if (typeof biometricEnabled === 'boolean') user.biometricEnabled = biometricEnabled;
    await user.save();
    return res.json({ ok: true, mfaEnabled: user.mfaEnabled, biometricEnabled: user.biometricEnabled });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
