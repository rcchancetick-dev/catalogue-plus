import sql from '../../../../lib/db';
import { getAdminFromReq } from '../../../../lib/auth';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  try {
    const { id } = req.query;
    const { motif } = req.body;
    const lr = await sql`SELECT * FROM loans WHERE id = ${id}`;
    if (lr.length === 0) return res.status(404).json({ error: 'Introuvable.' });
    if (lr[0].statut !== 'en_attente') return res.status(409).json({ error: 'Deja traitee.' });
    await sql`UPDATE loans SET statut='refuse', date_validation=NOW(), motif_refus=${motif || 'Non precise'}, valide_par=${admin.id} WHERE id=${id}`;
    await sql`INSERT INTO activity_log (type_action, description, admin_id, user_id) VALUES ('refus_emprunt', ${'Refuse: ' + (motif || 'sans motif')}, ${admin.id}, ${lr[0].user_id})`;
    return res.status(200).json({ message: 'Demande refusee.' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
}
