import sql from '../../../lib/db';
import { getUserFromReq } from '../../../lib/auth';
export default async function handler(req, res) {
  const d = getUserFromReq(req);
  if (!d) return res.status(401).json({ user: null });
  try { const r = await sql`SELECT id, nom, prenom, email, numero, etablissement, niveau FROM users WHERE id = ${d.id}`; if (r.length === 0) return res.status(401).json({ user: null }); return res.status(200).json({ user: r[0] }); } catch (e) { return res.status(500).json({ error: 'Erreur serveur' }); }
}
