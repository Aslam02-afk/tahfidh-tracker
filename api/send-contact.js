module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

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
    return res.status(500).json({ ok: false, error: 'Server not configured (BOT_TOKEN / USER_ID missing)' });
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
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send-contact]', err.message);
    return res.status(502).json({ ok: false, error: err.message });
  }
};
