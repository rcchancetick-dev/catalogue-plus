export default function handler(req, res) {
  res.status(200).json({ ok: true, service: 'catalogue-plus', mode: 'online' });
}
