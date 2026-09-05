import sql from '../../../lib/db';
import { getUserFromReq, getAdminFromReq } from '../../../lib/auth';
import { notifyAdmins } from '../../../lib/notify';
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Connectez-vous pour emprunter.' });
    try {
      const { bookUid, dureeJours } = req.body;
      if (!bookUid) return res.status(400).json({ error: 'Livre non specifie.' });
      const br = await sql`SELECT * FROM books WHERE uid = ${bookUid}`;
      if (br.length === 0) return res.status(404).json({ error: 'Introuvable.' });
      const b = br[0];
      if (b.exemplaires_disponibles <= 0) return res.status(409).json({ error: "Livre indisponible." });
      const p = await sql`SELECT * FROM loans WHERE user_id=${user.id} AND book_id=${b.id} AND statut IN ('en_attente','en_cours')`;
      if (p.length > 0) return res.status(409).json({ error: 'Demande deja active pour ce livre.' });
      const duree = parseInt(dureeJours) || 14;
      const r = await sql`INSERT INTO loans (user_id, book_id, statut, duree_jours) VALUES (${user.id}, ${b.id}, 'en_attente', ${duree}) RETURNING *`;

      try {
        const userInfo = await sql`SELECT nom, prenom FROM users WHERE id = ${user.id}`;
        await notifyAdmins({
          type: 'nouvelle_demande',
          title: 'Nouvelle demande d\'emprunt',
          message: `${userInfo[0].prenom} ${userInfo[0].nom} souhaite emprunter "${b.titre}" pour ${duree} jours.`,
          loanId: r[0].id,
          bookId: b.id
        });
      } catch (notifErr) {
        console.error('Notification non envoyee (non bloquant):', notifErr);
      }

      return res.status(201).json({ message: "Demande envoyee. L'administrateur va la traiter.", loan: r[0] });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }
  if (req.method === 'GET') {
    const user = getUserFromReq(req);
    const admin = getAdminFromReq(req);
    try {
      if (admin) {
        const { statut } = req.query;
        const rows = statut
          ? await sql`SELECT l.*, b.titre AS livre_titre, b.auteur AS livre_auteur, b.uid AS livre_uid, u.nom AS user_nom, u.prenom AS user_prenom, u.email AS user_email, u.numero AS user_numero FROM loans l JOIN books b ON l.book_id=b.id JOIN users u ON l.user_id=u.id WHERE l.statut=${statut} ORDER BY l.date_demande DESC`
          : await sql`SELECT l.*, b.titre AS livre_titre, b.auteur AS livre_auteur, b.uid AS livre_uid, u.nom AS user_nom, u.prenom AS user_prenom, u.email AS user_email, u.numero AS user_numero FROM loans l JOIN books b ON l.book_id=b.id JOIN users u ON l.user_id=u.id ORDER BY l.date_demande DESC`;
        return res.status(200).json({ loans: rows });
      }
      if (user) { const rows = await sql`SELECT l.*, b.titre AS livre_titre, b.auteur AS livre_auteur, b.uid AS livre_uid, b.couverture_url FROM loans l JOIN books b ON l.book_id=b.id WHERE l.user_id=${user.id} ORDER BY l.date_demande DESC`; return res.status(200).json({ loans: rows }); }
      return res.status(401).json({ error: 'Non autorise.' });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }
  return res.status(405).json({ error: 'Methode non autorisee' });
}
