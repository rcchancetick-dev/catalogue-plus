import sql from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });

  const secret = req.headers['x-sync-secret'];
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Cle de synchronisation invalide.' });
  }

  try {
    const { local_uid, book_uid, statut, duree_jours, date_demande, user_local_uid, user_fallback } = req.body;
    if (!local_uid || !book_uid || !user_local_uid) {
      return res.status(400).json({ error: 'Champs obligatoires manquants pour la synchronisation.' });
    }

    const already = await sql`SELECT id FROM loans WHERE local_uid = ${local_uid}`;
    if (already.length > 0) {
      return res.status(200).json({ message: 'Deja synchronise.', id: already[0].id });
    }

    const bookRows = await sql`SELECT id FROM books WHERE uid = ${book_uid}`;
    if (bookRows.length === 0) {
      return res.status(404).json({ error: 'Livre introuvable en ligne (uid: ' + book_uid + ').' });
    }
    const bookId = bookRows[0].id;

    let userRows = await sql`SELECT id FROM users WHERE local_uid = ${user_local_uid}`;
    let userId;
    if (userRows.length > 0) {
      userId = userRows[0].id;
    } else if (user_fallback && user_fallback.email) {
      const existing = await sql`SELECT id FROM users WHERE email = ${user_fallback.email.toLowerCase()}`;
      if (existing.length > 0) {
        userId = existing[0].id;
        await sql`UPDATE users SET local_uid = ${user_local_uid} WHERE id = ${userId}`;
      } else {
        const r = await sql`
          INSERT INTO users (nom, prenom, numero, email, etablissement, niveau, is_etudiant, password_hash, local_uid)
          VALUES (${user_fallback.nom}, ${user_fallback.prenom}, ${user_fallback.numero}, ${user_fallback.email.toLowerCase()}, ${user_fallback.etablissement || null}, ${user_fallback.niveau || null}, ${!!user_fallback.is_etudiant}, ${user_fallback.password_hash}, ${user_local_uid})
          RETURNING id
        `;
        userId = r[0].id;
      }
    } else {
      return res.status(404).json({ error: 'Utilisateur introuvable en ligne et aucune donnee de secours fournie.' });
    }

    const r = await sql`
      INSERT INTO loans (user_id, book_id, statut, duree_jours, date_demande, local_uid, synced)
      VALUES (${userId}, ${bookId}, ${statut || 'en_attente'}, ${duree_jours || 14}, ${date_demande || new Date().toISOString()}, ${local_uid}, true)
      RETURNING id
    `;
    return res.status(201).json({ message: 'Emprunt synchronise.', id: r[0].id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erreur lors de la synchronisation emprunt.' });
  }
}
