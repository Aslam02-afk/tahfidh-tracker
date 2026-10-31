module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true, service: 'Tahfidh Tracker API', version: '1.3.0', platform: 'Vercel' });
};
