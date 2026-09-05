import sql from '../../../../lib/db';
import { getAdminFromReq } from '../../../../lib/auth';
import { notifyUser } from '../../../../lib/notify';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  try {
    const { id } = req.query;
    const lr = await sql`SELECT * FROM loans WHERE id = ${id}`;
    if (lr.length === 0) return res.status(404).json({ error: 'Introuvable.' });
    const loan = lr[0];
    if (loan.statut !== 'en_attente') return res.status(409).json({ error: 'Deja traitee.' });
    const br = await sql`SELECT * FROM books WHERE id = ${loan.book_id}`;
    const book = br[0];
    if (book.exemplaires_disponibles <= 0) return res.status(409).json({ error: 'Aucun exemplaire disponible.' });
    const d = new Date(); d.setDate(d.getDate() + (loan.duree_jours || 14));
    await sql`UPDATE loans SET statut='en_cours', date_validation=NOW(), date_emprunt=NOW(), date_retour_prevue=${d.toISOString().split('T')[0]}, valide_par=${admin.id} WHERE id=${id}`;
    await sql`UPDATE books SET exemplaires_disponibles=exemplaires_disponibles-1, statut=CASE WHEN exemplaires_disponibles-1<=0 THEN 'emprunte' ELSE statut END WHERE id=${book.id}`;
    await sql`INSERT INTO activity_log (type_action, description, admin_id, user_id) VALUES ('validation_emprunt', ${'Emprunt valide: ' + book.titre}, ${admin.id}, ${loan.user_id})`;
    await notifyUser({
      userId: loan.user_id,
      type: 'emprunt_valide',
      title: 'Emprunt valide !',
      message: `Votre demande pour "${book.titre}" a ete acceptee. A rendre avant le ${d.toLocaleDateString('fr-FR')}.`,
      loanId: loan.id,
      bookId: book.id
    });
    return res.status(200).json({ message: 'Demande validee.' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
}
