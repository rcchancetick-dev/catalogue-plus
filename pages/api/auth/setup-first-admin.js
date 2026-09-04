import sql from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const ex = await sql`SELECT COUNT(*)::int AS count FROM admins`;
    if (ex[0].count > 0) return res.status(403).json({ error: 'Un administrateur existe deja.' });
    const { nom, prenom, email, password, setupCode } = req.body;
    if (setupCode !== (process.env.ADMIN_SETUP_CODE || 'ESPA-2A-2026-INIT')) return res.status(403).json({ error: 'Code de configuration incorrect.' });
    if (!nom || !prenom || !email || !password || password.length < 8) return res.status(400).json({ error: 'Champs invalides.' });
    const hash = await hashPassword(password);
    const r = await sql`INSERT INTO admins (nom, prenom, email, password_hash, role) VALUES (${nom}, ${prenom}, ${email.toLowerCase().trim()}, ${hash}, 'super_admin') RETURNING id, nom, prenom, email`;
    return res.status(201).json({ message: 'Super-administrateur cree.', admin: r[0] });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
}
