import sql from '../../../../lib/db';
import { getActiveAdminFromReq } from '../../../../lib/adminGuard';
import { notifyUser } from '../../../../lib/notify';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  const admin = await getActiveAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve ou compte desactive.' });
  try {
    const { id } = req.query;
    const { motif } = req.body;
    const lr = await sql`SELECT * FROM loans WHERE id = ${id}`;
    if (lr.length === 0) return res.status(404).json({ error: 'Introuvable.' });
    if (lr[0].statut !== 'en_attente') return res.status(409).json({ error: 'Deja traitee.' });
    await sql`UPDATE loans SET statut='refuse', date_validation=NOW(), motif_refus=${motif || 'Non precise'}, valide_par=${admin.id} WHERE id=${id}`;
    await sql`INSERT INTO activity_log (type_action, description, admin_id, user_id) VALUES ('refus_emprunt', ${'Refuse: ' + (motif || 'sans motif')}, ${admin.id}, ${lr[0].user_id})`;

    try {
      const br = await sql`SELECT titre FROM books WHERE id = ${lr[0].book_id}`;
      await notifyUser({
        userId: lr[0].user_id,
        type: 'emprunt_refuse',
        title: 'Demande refusee',
        message: `Votre demande pour "${br[0].titre}" a ete refusee. Motif : ${motif || 'non precise'}.`,
        loanId: lr[0].id,
        bookId: lr[0].book_id
      });
    } catch (notifErr) {
      console.error('Notification non envoyee (non bloquant):', notifErr);
    }

    return res.status(200).json({ message: 'Demande refusee.' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
}
