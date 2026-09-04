import sql from '../../../../lib/db';
import { getAdminFromReq } from '../../../../lib/auth';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  try {
    const { uid } = req.query;
    const br = await sql`SELECT * FROM books WHERE uid = ${uid}`;
    if (br.length === 0) return res.status(404).json({ error: 'Introuvable.' });
    const b = br[0];
    const al = await sql`SELECT * FROM loans WHERE book_id = ${b.id} AND statut = 'en_cours' ORDER BY date_emprunt DESC LIMIT 1`;
    if (al.length > 0) await sql`UPDATE loans SET statut='retourne', date_retour_effective=NOW() WHERE id=${al[0].id}`;
    const na = Math.min(b.exemplaires_disponibles + 1, b.nombre_exemplaires);
    await sql`UPDATE books SET exemplaires_disponibles=${na}, statut='disponible', updated_at=NOW() WHERE id=${b.id}`;
    await sql`INSERT INTO activity_log (type_action, description, admin_id) VALUES ('retour_livre', ${'Retour: ' + b.titre}, ${admin.id})`;
    return res.status(200).json({ message: 'Livre marque comme rendu.' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
}
