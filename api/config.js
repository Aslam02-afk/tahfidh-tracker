module.exports = (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const USER_ID   = process.env.USER_ID;

  if (!BOT_TOKEN || !USER_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured (BOT_TOKEN / USER_ID missing)' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true, botToken: BOT_TOKEN, userId: USER_ID });
};
