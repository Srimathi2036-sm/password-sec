const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

async function getTransporter() {
  if (process.env.SMTP_URL) return nodemailer.createTransport({ url: process.env.SMTP_URL });
  const test = await nodemailer.createTestAccount();
  return nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, auth: { user: test.user, pass: test.pass } });
}

router.post('/generate', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = ('' + Math.floor(100000 + Math.random() * 900000));
    user.mfaTemp = otp;
    user.mfaExpires = Date.now() + 1000 * 60 * 5; // 5 minutes
    await user.save();
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from: 'no-reply@securepass.local', to: email, subject: 'Your OTP', text: `Your OTP: ${otp}` });
    const data = { ok: true };
    if (nodemailer.getTestMessageUrl(info)) data.preview = nodemailer.getTestMessageUrl(info);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.mfaTemp || !user.mfaExpires || user.mfaExpires < Date.now()) return res.status(400).json({ error: 'OTP expired or not generated' });
    if (user.mfaTemp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    user.mfaTemp = undefined;
    user.mfaExpires = undefined;
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
