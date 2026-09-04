import sql from '../../../lib/db';
import { getAdminFromReq } from '../../../lib/auth';
import ExcelJS from 'exceljs';
export default async function handler(req, res) {
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const { type } = req.query;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Catalogue+ ESPA'; wb.created = new Date();
    if (type === 'livres') {
      const books = await sql`SELECT * FROM books ORDER BY titre ASC`;
      const s = wb.addWorksheet('Livres');
      s.columns = [{header:'ID',key:'id',width:8},{header:'Titre',key:'titre',width:35},{header:'Auteur',key:'auteur',width:25},{header:'ISBN',key:'isbn',width:18},{header:'Editeur',key:'editeur',width:20},{header:'Annee',key:'annee_publication',width:10},{header:'Categorie',key:'categorie',width:18},{header:'Total',key:'nombre_exemplaires',width:10},{header:'Disponibles',key:'exemplaires_disponibles',width:12},{header:'Statut',key:'statut',width:14},{header:'Emplacement',key:'emplacement',width:20}];
      s.getRow(1).font = { bold: true };
      books.forEach(b => s.addRow(b));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=catalogue-livres.xlsx');
      return res.status(200).send(Buffer.from(await wb.xlsx.writeBuffer()));
    }
    if (type === 'emprunts') {
      const loans = await sql`SELECT l.id, u.nom AS user_nom, u.prenom AS user_prenom, u.email AS user_email, b.titre AS livre_titre, b.auteur AS livre_auteur, l.statut, l.date_demande, l.date_emprunt, l.date_retour_prevue, l.date_retour_effective, l.motif_refus FROM loans l JOIN users u ON l.user_id=u.id JOIN books b ON l.book_id=b.id ORDER BY l.date_demande DESC`;
      const s = wb.addWorksheet('Emprunts');
      s.columns = [{header:'ID',key:'id',width:8},{header:'Nom',key:'user_nom',width:18},{header:'Prenom',key:'user_prenom',width:18},{header:'Email',key:'user_email',width:28},{header:'Livre',key:'livre_titre',width:32},{header:'Auteur',key:'livre_auteur',width:22},{header:'Statut',key:'statut',width:14},{header:'Demande',key:'date_demande',width:20},{header:'Emprunt',key:'date_emprunt',width:20},{header:'Retour prevu',key:'date_retour_prevue',width:16},{header:'Retour effectif',key:'date_retour_effective',width:20},{header:'Motif refus',key:'motif_refus',width:30}];
      s.getRow(1).font = { bold: true };
      loans.forEach(l => s.addRow(l));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=historique-emprunts.xlsx');
      return res.status(200).send(Buffer.from(await wb.xlsx.writeBuffer()));
    }
    if (type === 'utilisateurs') {
      const users = await sql`SELECT id, nom, prenom, numero, email, etablissement, niveau, created_at FROM users ORDER BY created_at DESC`;
      const s = wb.addWorksheet('Utilisateurs');
      s.columns = [{header:'ID',key:'id',width:8},{header:'Nom',key:'nom',width:18},{header:'Prenom',key:'prenom',width:18},{header:'Numero',key:'numero',width:16},{header:'Email',key:'email',width:28},{header:'Etablissement',key:'etablissement',width:28},{header:'Niveau',key:'niveau',width:14},{header:'Inscrit le',key:'created_at',width:20}];
      s.getRow(1).font = { bold: true };
      users.forEach(u => s.addRow(u));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=utilisateurs.xlsx');
      return res.status(200).send(Buffer.from(await wb.xlsx.writeBuffer()));
    }
    return res.status(400).json({ error: 'Type invalide.' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur export.' }); }
}
