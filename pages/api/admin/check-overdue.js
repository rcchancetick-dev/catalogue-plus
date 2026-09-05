import sql from '../../../lib/db';
import { notifyUser, notifyAdmins } from '../../../lib/notify';

export default async function handler(req, res) {
  try {
    const overdue = await sql`
      SELECT l.*, b.titre AS livre_titre, u.prenom AS user_prenom, u.nom AS user_nom, u.id AS user_id
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      WHERE l.statut = 'en_cours' AND l.date_retour_prevue < CURRENT_DATE AND l.overdue_notified = false
    `;

    for (const loan of overdue) {
      await notifyUser({
        userId: loan.user_id,
        type: 'retard',
        title: 'Retard de retour',
        message: `Le livre "${loan.livre_titre}" devait etre rendu le ${new Date(loan.date_retour_prevue).toLocaleDateString('fr-FR')}. Merci de le rapporter au plus vite.`,
        loanId: loan.id,
        bookId: loan.book_id
      });
      await notifyAdmins({
        type: 'retard',
        title: 'Emprunt en retard',
        message: `${loan.user_prenom} ${loan.user_nom} n'a pas rendu "${loan.livre_titre}" (retour prevu le ${new Date(loan.date_retour_prevue).toLocaleDateString('fr-FR')}).`,
        loanId: loan.id,
        bookId: loan.book_id
      });
      await sql`UPDATE loans SET overdue_notified = true WHERE id = ${loan.id}`;
    }

    return res.status(200).json({ message: 'Verification terminee.', overdueCount: overdue.length });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur lors de la verification des retards.' }); }
}
