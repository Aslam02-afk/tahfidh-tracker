// Tahfidh Tracker – Server (Static PWA + Backend API)
// Deploy to Render: https://render.com
// Start: node server.js | requires Node 18+

try { require('dotenv').config(); } catch (_) {}
const express = require('express');
const path    = require('path');

const app = express();
app.use(express.json());

// ── CORS — allow requests from any origin (dev / Railway / PWA) ──────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || '*',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Tahfidh Tracker API', version: '1.3.0' });
});

// ── /api/config ────────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured (BOT_TOKEN / USER_ID missing)' });
  }

  res.json({ ok: true, botToken: BOT_TOKEN, userId: USER_ID });
});

// ── /api/send-rating ───────────────────────────────────────────────────────
app.post('/api/send-rating', async (req, res) => {
  const { rating, comment, timestamp } = req.body;

  const num = Number(rating);
  if (!num || num < 1 || num > 5) {
    return res.status(400).json({ ok: false, error: 'rating must be 1–5' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  const stars    = '⭐'.repeat(num);
  const feedback = (comment && comment.trim()) ? comment.trim() : 'No comment';
  const time     = timestamp || new Date().toISOString();

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

// ── /api/send-contact ──────────────────────────────────────────────────────
app.post('/api/send-contact', async (req, res) => {
  const { name, email, subject, message, timestamp } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ ok: false, error: 'Message is required' });
  }

  const trimmedEmail = (email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ ok: false, error: 'Valid email is required' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  const senderName = (name && name.trim()) ? name.trim() : 'غير مذكور / Anonymous';
  const topic      = (subject && subject.trim()) ? subject.trim() : 'عام / General';
  const time       = timestamp || new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });

  const text = [
    '━━━━━━━━━━━━━━━━━━',
    '📩 رسالة تواصل جديدة – Tahfidh Tracker',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `👤 الاسم: ${senderName}`,
    `📧 البريد: ${trimmedEmail}`,
    `📌 الموضوع: ${topic}`,
    '',
    '💬 الرسالة:',
    message.trim(),
    '',
    `🕒 التاريخ: ${time}`,
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
    console.error('[send-contact]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

// ── Serve static PWA files ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// Specifically handle all .html pages
app.get('/:page.html', (req, res, next) => {
  const filePath = path.join(__dirname, req.params.page + '.html');
  res.sendFile(filePath, err => {
    if (err) next();
  });
});

// Fallback: serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Tahfidh Tracker running on port ${PORT}`);
});
