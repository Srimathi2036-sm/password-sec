const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true }
  }],
  mfaEnabled: { type: Boolean, default: false },
  biometricEnabled: { type: Boolean, default: false },
  resetToken: { type: String },
  resetExpires: { type: Date },
  mfaTemp: { type: String },
  mfaExpires: { type: Date },
  webauthn: {
    credentialId: { type: String },
    publicKey: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
