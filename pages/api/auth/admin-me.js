import sql from '../../../lib/db';
import { getAdminFromReq } from '../../../lib/auth';
export default async function handler(req, res) {
  const d = getAdminFromReq(req);
  if (!d) return res.status(401).json({ admin: null });
  try { const r = await sql`SELECT id, nom, prenom, email, role FROM admins WHERE id = ${d.id}`; if (r.length === 0) return res.status(401).json({ admin: null }); return res.status(200).json({ admin: r[0] }); } catch (e) { return res.status(500).json({ error: 'Erreur serveur' }); }
}
