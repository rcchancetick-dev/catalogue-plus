import sql from '../../lib/db';

/**
 * ROUTE DE DIAGNOSTIC TEMPORAIRE - a supprimer une fois le bug resolu.
 * Affiche le contenu brut de la table notifications + le statut des admins,
 * pour identifier si le probleme est cote ecriture (creation) ou lecture (affichage).
 * Accessible directement dans le navigateur: /api/debug-notifications
 */
export default async function handler(req, res) {
  try {
    const allNotifs = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20`;
    const admins = await sql`SELECT id, nom, prenom, email, is_active FROM admins`;
    const users = await sql`SELECT id, nom, prenom, email FROM users ORDER BY created_at DESC LIMIT 5`;
    const loans = await sql`SELECT id, user_id, book_id, statut, date_demande FROM loans ORDER BY date_demande DESC LIMIT 5`;

    return res.status(200).json({
      total_notifications: allNotifs.length,
      notifications: allNotifs,
      admins_count: admins.length,
      admins: admins,
      recent_users: users,
      recent_loans: loans
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
