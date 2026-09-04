import sql from '../../../lib/db';
import { getAdminFromReq } from '../../../lib/auth';
import PDFDocument from 'pdfkit';
export default async function handler(req, res) {
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const { type } = req.query;
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    const done = new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));
    doc.fontSize(18).fillColor('#1a1a2e').text('Catalogue+ - Bibliotheque ESPA', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text("Ecole Superieure Polytechnique d'Antsiranana", { align: 'center' });
    doc.moveDown(0.3); doc.fontSize(9).text('Genere le ' + new Date().toLocaleString('fr-FR'), { align: 'center' }); doc.moveDown(1.5);
    if (type === 'livres') {
      const books = await sql`SELECT titre, auteur, categorie, exemplaires_disponibles, nombre_exemplaires, statut FROM books ORDER BY titre ASC`;
      doc.fontSize(14).fillColor('#1a1a2e').text('Liste des livres', { underline: true }); doc.moveDown(0.5);
      books.forEach((b, i) => { doc.fontSize(10).fillColor('#000').text((i+1) + '. ' + b.titre + ' - ' + b.auteur); doc.fontSize(8).fillColor('#555').text('   Categorie: ' + (b.categorie || 'N/A') + ' | Dispo: ' + b.exemplaires_disponibles + '/' + b.nombre_exemplaires + ' | ' + b.statut); doc.moveDown(0.3); });
    } else if (type === 'emprunts') {
      const loans = await sql`SELECT u.nom AS user_nom, u.prenom AS user_prenom, b.titre AS livre_titre, l.statut, l.date_demande, l.date_retour_prevue FROM loans l JOIN users u ON l.user_id=u.id JOIN books b ON l.book_id=b.id ORDER BY l.date_demande DESC`;
      doc.fontSize(14).fillColor('#1a1a2e').text('Historique des emprunts', { underline: true }); doc.moveDown(0.5);
      loans.forEach((l, i) => { doc.fontSize(10).fillColor('#000').text((i+1) + '. ' + l.user_prenom + ' ' + l.user_nom + ' -> ' + l.livre_titre); doc.fontSize(8).fillColor('#555').text('   ' + l.statut + ' | Demande: ' + new Date(l.date_demande).toLocaleDateString('fr-FR')); doc.moveDown(0.3); });
    } else { doc.fontSize(12).text('Type invalide.'); }
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#999').text('Genere par Catalogue+ - Mini-projet ESPA 2eme annee', { align: 'center' });
    doc.end();
    const buf = await done;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport-' + (type || 'catalogue') + '.pdf');
    return res.status(200).send(buf);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur PDF.' }); }
}
