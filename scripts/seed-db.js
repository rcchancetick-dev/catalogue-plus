require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const sql = neon(process.env.DATABASE_URL);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
async function seed() {
  const adminEmail = 'admin@espa.mg';
  const adminPass = await bcrypt.hash('Admin@2026', 12);
  const ex = await sql`SELECT id FROM admins WHERE email = ${adminEmail}`;
  if (ex.length === 0) {
    await sql`INSERT INTO admins (nom, prenom, email, password_hash, role) VALUES ('Administrateur', 'Principal', ${adminEmail}, ${adminPass}, 'super_admin')`;
    console.log('Admin: admin@espa.mg / Admin@2026 (a changer)');
  }
  const cats = ['Informatique','Mathematiques','Physique','Genie Civil','Electronique','Litterature','Sciences Humaines','Economie & Gestion'];
  for (const c of cats) { await sql`INSERT INTO categories (nom) VALUES (${c}) ON CONFLICT (nom) DO NOTHING`; }
  const books = [
    { titre: "Introduction a l'Algorithmique", auteur: 'Thomas H. Cormen', isbn: '978-2100078008', editeur: 'Dunod', annee: 2010, categorie: 'Informatique', pages: 1176, description: 'Reference sur les algorithmes fondamentaux.', emplacement: 'Rayon A-3', exemplaires: 3 },
    { titre: 'Analyse Numerique', auteur: 'Jean-Pierre Demailly', isbn: '978-2759800620', editeur: 'EDP Sciences', annee: 2016, categorie: 'Mathematiques', pages: 344, description: 'Reference en analyse numerique.', emplacement: 'Rayon B-1', exemplaires: 2 },
    { titre: 'Physique Generale', auteur: 'Marcelo Alonso', isbn: '978-2761334892', editeur: 'De Boeck', annee: 2004, categorie: 'Physique', pages: 512, description: 'Cours complet de physique generale.', emplacement: 'Rayon C-2', exemplaires: 4 },
    { titre: 'Beton Arme', auteur: 'Jean Roux', isbn: '978-2281113456', editeur: 'Eyrolles', annee: 2015, categorie: 'Genie Civil', pages: 620, description: 'Guide pratique selon les Eurocodes.', emplacement: 'Rayon D-1', exemplaires: 2 },
    { titre: 'Electronique Analogique et Numerique', auteur: 'Paul Horowitz', isbn: '978-2100798179', editeur: 'Dunod', annee: 2018, categorie: 'Electronique', pages: 890, description: 'Reference sur les circuits.', emplacement: 'Rayon E-4', exemplaires: 3 }
  ];
  for (const b of books) {
    const e = await sql`SELECT id FROM books WHERE isbn = ${b.isbn}`;
    if (e.length > 0) continue;
    const uid = nanoid(12);
    const url = SITE_URL + '/livre/' + uid;
    const qr = await QRCode.toDataURL(url, { width: 500, margin: 2 });
    await sql`INSERT INTO books (uid, titre, auteur, isbn, editeur, annee_publication, categorie, nombre_pages, description, emplacement, nombre_exemplaires, exemplaires_disponibles, qr_code_data) VALUES (${uid}, ${b.titre}, ${b.auteur}, ${b.isbn}, ${b.editeur}, ${b.annee}, ${b.categorie}, ${b.pages}, ${b.description}, ${b.emplacement}, ${b.exemplaires}, ${b.exemplaires}, ${qr})`;
  }
  console.log('Seed termine.');
}
seed().catch((e) => { console.error(e); process.exit(1); });
