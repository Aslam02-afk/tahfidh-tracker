module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { rating, comment, timestamp } = req.body || {};
  const num = Number(rating);
  if (!num || num < 1 || num > 5) {
    return res.status(400).json({ ok: false, error: 'rating must be 1–5' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured (BOT_TOKEN / USER_ID missing)' });
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
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send-rating]', err.message);
    return res.status(502).json({ ok: false, error: err.message });
  }
};
