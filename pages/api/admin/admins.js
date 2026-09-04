import sql from '../../../lib/db';
import { getAdminFromReq, hashPassword } from '../../../lib/auth';
export default async function handler(req, res) {
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  if (req.method === 'GET') { try { const r = await sql`SELECT id, nom, prenom, email, role, created_at, is_active FROM admins ORDER BY created_at DESC`; return res.status(200).json({ admins: r }); } catch (e) { return res.status(500).json({ error: 'Erreur.' }); } }
  if (req.method === 'POST') {
    if (admin.adminRole !== 'super_admin') return res.status(403).json({ error: 'Reserve au super-admin.' });
    try {
      const { nom, prenom, email, password, role } = req.body;
      if (!nom || !prenom || !email || !password) return res.status(400).json({ error: 'Champs obligatoires.' });
      if (password.length < 8) return res.status(400).json({ error: 'Mdp >= 8 caracteres.' });
      const ex = await sql`SELECT id FROM admins WHERE email = ${email.toLowerCase().trim()}`;
      if (ex.length > 0) return res.status(409).json({ error: 'Admin existe deja.' });
      const hash = await hashPassword(password);
      const r = await sql`INSERT INTO admins (nom, prenom, email, password_hash, role) VALUES (${nom}, ${prenom}, ${email.toLowerCase().trim()}, ${hash}, ${role || 'admin'}) RETURNING id, nom, prenom, email, role`;
      await sql`INSERT INTO activity_log (type_action, description, admin_id) VALUES ('ajout_admin', ${'Nouvel admin: ' + email}, ${admin.id})`;
      return res.status(201).json({ message: 'Administrateur cree.', admin: r[0] });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }
  return res.status(405).json({ error: 'Methode non autorisee' });
}
