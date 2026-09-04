require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3500;
const JWT_SECRET = process.env.JWT_SECRET || 'local-secret-change-me';
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'ESPA2A';
const db = new Database(path.join(__dirname, 'data', 'catalogueplus.db'));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function signToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); }
function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }
function getUser(req) { const t = req.cookies.session; return t ? verifyToken(t) : null; }
function getAdmin(req) { const t = req.cookies.admin_session; const d = t ? verifyToken(t) : null; return d && d.role === 'admin' ? d : null; }

app.post('/api/auth/register', (req, res) => {
  const { nom, prenom, numero, email, etablissement, niveau, is_etudiant, password, confirmPassword } = req.body;
  if (!nom || !prenom || !numero || !email || !password || password !== confirmPassword) return res.status(400).json({ error: 'Champs invalides.' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Compte deja existant (localement).' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (nom, prenom, numero, email, etablissement, niveau, is_etudiant, password_hash) VALUES (?,?,?,?,?,?,?,?)').run(nom, prenom, numero, email.toLowerCase(), etablissement || null, niveau || null, is_etudiant ? 1 : 0, hash);
  const token = signToken({ id: info.lastInsertRowid, email, role: 'user' });
  res.cookie('session', token, { httpOnly: true, maxAge: 2592000000 });
  res.status(201).json({ message: 'Inscription reussie (mode local).', user: { id: info.lastInsertRowid, nom, prenom, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Identifiants incorrects.' });
  const token = signToken({ id: user.id, email: user.email, role: 'user' });
  res.cookie('session', token, { httpOnly: true, maxAge: 2592000000 });
  res.json({ message: 'Connexion reussie (mode local).', user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => { res.clearCookie('session'); res.json({ message: 'Deconnecte.' }); });

app.get('/api/auth/me', (req, res) => {
  const d = getUser(req);
  if (!d) return res.status(401).json({ user: null });
  const user = db.prepare('SELECT id, nom, prenom, email FROM users WHERE id = ?').get(d.id);
  res.json({ user: user || null });
});

app.post('/api/auth/admin-login', (req, res) => {
  const { email, password, secretCode } = req.body;
  if (secretCode !== ADMIN_ACCESS_CODE) return res.status(403).json({ error: "Code d'acces incorrect." });
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get((email || '').toLowerCase());
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) return res.status(401).json({ error: 'Identifiants incorrects.' });
  const token = signToken({ id: admin.id, role: 'admin', adminRole: admin.role });
  res.cookie('admin_session', token, { httpOnly: true, maxAge: 43200000 });
  res.json({ message: 'Connexion admin reussie (local).', admin: { id: admin.id, nom: admin.nom, prenom: admin.prenom, role: admin.role } });
});

app.get('/api/books', (req, res) => {
  const { search } = req.query;
  let rows;
  if (search) { const term = '%' + search.toLowerCase() + '%'; rows = db.prepare('SELECT * FROM books WHERE LOWER(titre) LIKE ? OR LOWER(auteur) LIKE ?').all(term, term); }
  else { rows = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all(); }
  res.json({ books: rows });
});

app.get('/api/books/:uid', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE uid = ?').get(req.params.uid);
  if (!book) return res.status(404).json({ error: 'Livre introuvable localement.' });
  res.json({ book });
});

app.post('/api/books', (req, res) => {
  const admin = getAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve aux administrateurs.' });
  const { titre, auteur, isbn, editeur, annee_publication, categorie, nombre_pages, description, emplacement, nombre_exemplaires } = req.body;
  if (!titre || !auteur) return res.status(400).json({ error: 'Titre et auteur obligatoires.' });
  const uid = nanoid(12);
  const ex = parseInt(nombre_exemplaires) || 1;
  const info = db.prepare('INSERT INTO books (uid, titre, auteur, isbn, editeur, annee_publication, categorie, nombre_pages, description, emplacement, nombre_exemplaires, exemplaires_disponibles) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(uid, titre, auteur, isbn || null, editeur || null, annee_publication || null, categorie || null, nombre_pages || null, description || null, emplacement || null, ex, ex);
  res.status(201).json({ message: 'Livre ajoute localement.', book: { id: info.lastInsertRowid, uid } });
});

app.post('/api/loans', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Connectez-vous pour emprunter.' });
  const { bookUid, dureeJours } = req.body;
  const book = db.prepare('SELECT * FROM books WHERE uid = ?').get(bookUid);
  if (!book) return res.status(404).json({ error: 'Livre introuvable.' });
  if (book.exemplaires_disponibles <= 0) return res.status(409).json({ error: 'Livre indisponible.' });
  db.prepare('INSERT INTO loans (user_id, book_id, statut, duree_jours, synced) VALUES (?,?,?,?,0)').run(user.id, book.id, 'en_attente', parseInt(dureeJours) || 14);
  res.status(201).json({ message: "Demande enregistree localement. Elle sera synchronisee des que le Wi-Fi sera retabli." });
});

app.get('/api/loans', (req, res) => {
  const admin = getAdmin(req);
  const user = getUser(req);
  if (admin) { const rows = db.prepare('SELECT l.*, b.titre as livre_titre, u.nom as user_nom, u.prenom as user_prenom FROM loans l JOIN books b ON l.book_id=b.id JOIN users u ON l.user_id=u.id ORDER BY l.date_demande DESC').all(); return res.json({ loans: rows }); }
  if (user) { const rows = db.prepare('SELECT l.*, b.titre as livre_titre FROM loans l JOIN books b ON l.book_id=b.id WHERE l.user_id=? ORDER BY l.date_demande DESC').all(user.id); return res.json({ loans: rows }); }
  res.status(401).json({ error: 'Non autorise.' });
});

app.post('/api/loans/validate/:id', (req, res) => {
  const admin = getAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve.' });
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Introuvable.' });
  db.prepare("UPDATE loans SET statut='en_cours', date_validation=CURRENT_TIMESTAMP, date_emprunt=CURRENT_TIMESTAMP WHERE id=?").run(loan.id);
  db.prepare('UPDATE books SET exemplaires_disponibles = exemplaires_disponibles - 1 WHERE id = ?').run(loan.book_id);
  res.json({ message: 'Emprunt valide localement.' });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log(' Catalogue+ - Serveur local de secours');
  console.log(' En ecoute sur http://localhost:' + PORT);
  console.log(' Partagez cette adresse sur le reseau Wi-Fi de la bibliotheque.');
  console.log('========================================');
});
