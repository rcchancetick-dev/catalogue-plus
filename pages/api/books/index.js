import sql from '../../../lib/db';
import { getAdminFromReq } from '../../../lib/auth';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { search, categorie, statut } = req.query;
      let rows;
      if (search) { const t = '%' + search.toLowerCase() + '%'; rows = await sql`SELECT * FROM books WHERE (LOWER(titre) LIKE ${t} OR LOWER(auteur) LIKE ${t} OR LOWER(isbn) LIKE ${t}) ORDER BY created_at DESC`; }
      else if (categorie) { rows = await sql`SELECT * FROM books WHERE categorie = ${categorie} ORDER BY created_at DESC`; }
      else { rows = await sql`SELECT * FROM books ORDER BY created_at DESC`; }
      if (statut) rows = rows.filter(b => b.statut === statut);
      return res.status(200).json({ books: rows });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }
  if (req.method === 'POST') {
    const admin = getAdminFromReq(req);
    if (!admin) return res.status(401).json({ error: 'Acces reserve aux administrateurs.' });
    try {
      const { titre, auteur, isbn, editeur, annee_publication, categorie, langue, nombre_pages, description, couverture_url, emplacement, nombre_exemplaires } = req.body;
      if (!titre || !auteur) return res.status(400).json({ error: "Titre et auteur obligatoires." });
      const uid = nanoid(12);
      const site = process.env.NEXT_PUBLIC_SITE_URL || ('https://' + req.headers.host);
      const url = site + '/livre/' + uid;
      const qr = await QRCode.toDataURL(url, { width: 500, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } });
      const ex = parseInt(nombre_exemplaires) || 1;
      const r = await sql`INSERT INTO books (uid, titre, auteur, isbn, editeur, annee_publication, categorie, langue, nombre_pages, description, couverture_url, emplacement, nombre_exemplaires, exemplaires_disponibles, qr_code_data) VALUES (${uid}, ${titre}, ${auteur}, ${isbn || null}, ${editeur || null}, ${annee_publication ? parseInt(annee_publication) : null}, ${categorie || null}, ${langue || 'Francais'}, ${nombre_pages ? parseInt(nombre_pages) : null}, ${description || null}, ${couverture_url || null}, ${emplacement || null}, ${ex}, ${ex}, ${qr}) RETURNING *`;
      await sql`INSERT INTO activity_log (type_action, description, admin_id) VALUES ('ajout_livre', ${'Ajout: ' + titre}, ${admin.id})`;
      return res.status(201).json({ message: 'Livre ajoute avec succes.', book: r[0], qrUrl: url });
    } catch (e) { console.error(e); return res.status(500).json({ error: "Erreur lors de l'ajout." }); }
  }
  return res.status(405).json({ error: 'Methode non autorisee' });
}
