const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  websiteName: { type: String, required: true },
  siteUsername: { type: String, required: true },
  sitePassword: { type: String, required: true }, // encrypted
  tokenId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PasswordEntry', PasswordSchema);
