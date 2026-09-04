import sql from '../../../lib/db';
import { getAdminFromReq } from '../../../lib/auth';
export default async function handler(req, res) {
  const { uid } = req.query;
  if (req.method === 'GET') {
    try { const r = await sql`SELECT * FROM books WHERE uid = ${uid}`; if (r.length === 0) return res.status(404).json({ error: 'Livre introuvable.' }); return res.status(200).json({ book: r[0] }); } catch (e) { return res.status(500).json({ error: 'Erreur.' }); }
  }
  if (req.method === 'PUT') {
    const admin = getAdminFromReq(req);
    if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
    try {
      const ex = await sql`SELECT * FROM books WHERE uid = ${uid}`;
      if (ex.length === 0) return res.status(404).json({ error: 'Introuvable.' });
      const b = ex[0];
      const { titre, auteur, isbn, editeur, annee_publication, categorie, langue, nombre_pages, description, couverture_url, emplacement, nombre_exemplaires, statut } = req.body;
      const r = await sql`UPDATE books SET titre=${titre || b.titre}, auteur=${auteur || b.auteur}, isbn=${isbn !== undefined ? isbn : b.isbn}, editeur=${editeur !== undefined ? editeur : b.editeur}, annee_publication=${annee_publication ? parseInt(annee_publication) : b.annee_publication}, categorie=${categorie !== undefined ? categorie : b.categorie}, langue=${langue || b.langue}, nombre_pages=${nombre_pages ? parseInt(nombre_pages) : b.nombre_pages}, description=${description !== undefined ? description : b.description}, couverture_url=${couverture_url !== undefined ? couverture_url : b.couverture_url}, emplacement=${emplacement !== undefined ? emplacement : b.emplacement}, nombre_exemplaires=${nombre_exemplaires ? parseInt(nombre_exemplaires) : b.nombre_exemplaires}, statut=${statut || b.statut}, updated_at=NOW() WHERE uid=${uid} RETURNING *`;
      await sql`INSERT INTO activity_log (type_action, description, admin_id) VALUES ('modif_livre', ${'Modif: ' + r[0].titre}, ${admin.id})`;
      return res.status(200).json({ message: 'Mis a jour.', book: r[0] });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }
  if (req.method === 'DELETE') {
    const admin = getAdminFromReq(req);
    if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
    try { const ex = await sql`SELECT * FROM books WHERE uid = ${uid}`; if (ex.length === 0) return res.status(404).json({ error: 'Introuvable.' }); await sql`DELETE FROM books WHERE uid = ${uid}`; await sql`INSERT INTO activity_log (type_action, description, admin_id) VALUES ('suppr_livre', ${'Suppression: ' + ex[0].titre}, ${admin.id})`; return res.status(200).json({ message: 'Supprime.' }); } catch (e) { return res.status(500).json({ error: 'Erreur.' }); }
  }
  return res.status(405).json({ error: 'Methode non autorisee' });
}
