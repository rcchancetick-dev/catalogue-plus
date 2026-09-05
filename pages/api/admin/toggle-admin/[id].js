import sql from '../../../../lib/db';
import { getActiveAdminFromReq } from '../../../../lib/adminGuard';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  const admin = await getActiveAdminFromReq(req);
  if (!admin || admin.adminRole !== 'super_admin') return res.status(403).json({ error: 'Reserve au super-admin.' });
  try {
    const { id } = req.query;
    if (parseInt(id) === admin.id) return res.status(400).json({ error: 'Impossible de vous desactiver vous-meme.' });
    const r = await sql`SELECT * FROM admins WHERE id = ${id}`;
    if (r.length === 0) return res.status(404).json({ error: 'Introuvable.' });
    const ns = !r[0].is_active;
    await sql`UPDATE admins SET is_active=${ns} WHERE id=${id}`;
    return res.status(200).json({ message: ns ? 'Reactive.' : 'Desactive.' });
  } catch (e) { return res.status(500).json({ error: 'Erreur.' }); }
}
