// Tahfidh Tracker – Backend Server
// Serves static PWA files + /api/send-rating → Telegram
// Deploy to Render (free): https://render.com
// Start: node server.js   |   requires Node 18+

require('dotenv').config();
const express = require('express');
const path    = require('path');

const app = express();
app.use(express.json());

// ── CORS (allows PWA on any origin during dev) ──────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ── /api/config ─────────────────────────────────────────────────────────────
// Returns Telegram credentials safely from environment variables
// Token never appears in frontend code or GitHub
app.get('/api/config', (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured (BOT_TOKEN / USER_ID missing)' });
  }

  res.json({
    ok:       true,
    botToken: BOT_TOKEN,
    userId:   USER_ID
  });
});

// ── /api/send-rating ────────────────────────────────────────────────────────
app.post('/api/send-rating', async (req, res) => {
  const { rating, comment, timestamp } = req.body;

  // Validate
  const num = Number(rating);
  if (!num || num < 1 || num > 5) {
    return res.status(400).json({ ok: false, error: 'rating must be 1–5' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured (BOT_TOKEN / USER_ID missing)' });
  }

  const stars     = '⭐'.repeat(num);
  const feedback  = (comment && comment.trim()) ? comment.trim() : 'No comment';
  const time      = timestamp || new Date().toISOString();

  const text = [
    '━━━━━━━━━━━━━━━━━━',
    '⭐ Tahfidh Tracker – New Rating',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `📊 Rating: ${num} / 5  ${stars}`,
    `💬 Feedback:\n${feedback}`,
    '',
    `🕒 Time: ${time}`,
    '',
    '━━━━━━━━━━━━━━━━━━'
  ].join('\n');

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ chat_id: USER_ID, text })
      }
    );
    const data = await tgRes.json();
    if (!data.ok) throw new Error(data.description || 'Telegram error');

    res.json({ ok: true });
  } catch (err) {
    console.error('[send-rating]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

// ── Serve static PWA files ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// Fallback: serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Tahfidh Tracker server running on http://localhost:${PORT}`);
});