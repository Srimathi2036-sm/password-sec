require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vault');
const mfaRoutes = require('./routes/mfa');
const importRoutes = require('./routes/importExport');
const webauthnRoutes = require('./routes/webauthn');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/passwordDB';

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error(`Mongo connection attempt ${i + 1} failed:`, err.message || err);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error('Unable to connect to MongoDB after retries. Exiting.');
        process.exit(1);
      }
    }
  }
}

connectWithRetry();

mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/import', importRoutes);
app.use('/api/webauthn', webauthnRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
