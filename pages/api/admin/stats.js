import sql from '../../../lib/db';
import { getAdminFromReq } from '../../../lib/auth';
export default async function handler(req, res) {
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const totalBooks = await sql`SELECT COUNT(*)::int AS count, SUM(nombre_exemplaires)::int AS total_exemplaires FROM books`;
    const totalUsers = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const loansByStatus = await sql`SELECT statut, COUNT(*)::int AS count FROM loans GROUP BY statut`;
    const activeLoans = await sql`SELECT COUNT(*)::int AS count FROM loans WHERE statut='en_cours'`;
    const pendingLoans = await sql`SELECT COUNT(*)::int AS count FROM loans WHERE statut='en_attente'`;
    const overdue = await sql`SELECT COUNT(*)::int AS count FROM loans WHERE statut='en_cours' AND date_retour_prevue < CURRENT_DATE`;
    const topBooks = await sql`SELECT b.titre, b.auteur, COUNT(l.id)::int AS nb_emprunts FROM loans l JOIN books b ON l.book_id=b.id GROUP BY b.id, b.titre, b.auteur ORDER BY nb_emprunts DESC LIMIT 5`;
    const loansByMonth = await sql`SELECT TO_CHAR(date_demande,'YYYY-MM') AS mois, COUNT(*)::int AS count FROM loans WHERE date_demande > NOW() - INTERVAL '12 months' GROUP BY mois ORDER BY mois ASC`;
    const categoriesStats = await sql`SELECT categorie, COUNT(*)::int AS count FROM books WHERE categorie IS NOT NULL GROUP BY categorie ORDER BY count DESC`;
    const recentActivity = await sql`SELECT al.*, a.nom AS admin_nom, a.prenom AS admin_prenom FROM activity_log al LEFT JOIN admins a ON al.admin_id=a.id ORDER BY al.created_at DESC LIMIT 20`;
    return res.status(200).json({ totalBooks: totalBooks[0], totalUsers: totalUsers[0].count, loansByStatus, activeLoans: activeLoans[0].count, pendingLoans: pendingLoans[0].count, overdueLoans: overdue[0].count, topBooks, loansByMonth, categoriesStats, recentActivity });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
}
