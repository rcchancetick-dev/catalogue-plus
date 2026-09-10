import sql from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });

  const secret = req.headers['x-sync-secret'];
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Cle de synchronisation invalide.' });
  }

  try {
    const { local_uid, nom, prenom, numero, email, etablissement, niveau, is_etudiant, password_hash } = req.body;
    if (!local_uid || !nom || !prenom || !email || !password_hash) {
      return res.status(400).json({ error: 'Champs obligatoires manquants pour la synchronisation.' });
    }

    const already = await sql`SELECT id FROM users WHERE local_uid = ${local_uid}`;
    if (already.length > 0) {
      return res.status(200).json({ message: 'Deja synchronise.', id: already[0].id });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      await sql`UPDATE users SET local_uid = ${local_uid} WHERE id = ${existing[0].id}`;
      return res.status(200).json({ message: 'Compte existant relie.', id: existing[0].id });
    }

    const r = await sql`
      INSERT INTO users (nom, prenom, numero, email, etablissement, niveau, is_etudiant, password_hash, local_uid)
      VALUES (${nom}, ${prenom}, ${numero}, ${email.toLowerCase()}, ${etablissement || null}, ${niveau || null}, ${!!is_etudiant}, ${password_hash}, ${local_uid})
      RETURNING id
    `;
    return res.status(201).json({ message: 'Utilisateur synchronise.', id: r[0].id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erreur lors de la synchronisation utilisateur.' });
  }
}
