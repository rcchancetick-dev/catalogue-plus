require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3500;
const JWT_SECRET = process.env.JWT_SECRET || 'local-secret-change-me';
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'ESPA2A';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';
const SYNC_SECRET = process.env.SYNC_SECRET || JWT_SECRET;

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'catalogueplus.db'));

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
const localUid = nanoid(16);
const info = db.prepare('INSERT INTO users (nom, prenom, numero, email, etablissement, niveau, is_etudiant, password_hash, local_uid, synced) VALUES (?,?,?,?,?,?,?,?,?,0)').run(nom, prenom, numero, email.toLowerCase(), etablissement || null, niveau || null, is_etudiant ? 1 : 0, hash, localUid);
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
const localUid = nanoid(16);
db.prepare('INSERT INTO loans (user_id, book_id, statut, duree_jours, synced, local_uid) VALUES (?,?,?,?,0,?)').run(user.id, book.id, 'en_attente', parseInt(dureeJours) || 14, localUid);
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

// ============================================================
// SYNCHRONISATION AVEC LE SERVEUR EN LIGNE (Next.js / Neon Postgres)
// ============================================================
// Chaque enregistrement local (users, loans) possede un local_uid unique
// genere a la creation, et un flag synced (0 = pas encore envoye au serveur
// en ligne, 1 = confirme cote Neon). Cela permet d'eviter les doublons meme
// si la synchronisation est relancee plusieurs fois (idempotence).

async function pingOnlineServer() {
  if (!SITE_URL) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(SITE_URL + '/api/ping', { signal: controller.signal });
    clearTimeout(timeout);
    return resp.ok;
  } catch {
    return false;
  }
}

async function runSync() {
  if (!SITE_URL) {
    return { ok: false, error: "NEXT_PUBLIC_SITE_URL n'est pas configure." };
  }
  const online = await pingOnlineServer();
  if (!online) {
    return { ok: false, error: 'Aucune connexion Internet detectee vers le serveur en ligne.' };
  }

  const pendingUsers = db.prepare('SELECT * FROM users WHERE synced = 0').all();
  const pendingLoans = db.prepare(`
    SELECT l.*, u.local_uid as user_local_uid, u.nom as u_nom, u.prenom as u_prenom,
           u.numero as u_numero, u.email as u_email, u.etablissement as u_etablissement,
           u.niveau as u_niveau, u.is_etudiant as u_is_etudiant, u.password_hash as u_password_hash,
           b.uid as book_uid
    FROM loans l
    JOIN users u ON l.user_id = u.id
    JOIN books b ON l.book_id = b.id
    WHERE l.synced = 0
  `).all();

  let usersSynced = 0;
  let loansSynced = 0;
  const errors = [];

  for (const u of pendingUsers) {
    try {
      const resp = await fetch(SITE_URL + '/api/sync/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sync-secret': SYNC_SECRET },
        body: JSON.stringify({
          local_uid: u.local_uid, nom: u.nom, prenom: u.prenom, numero: u.numero,
          email: u.email, etablissement: u.etablissement, niveau: u.niveau,
          is_etudiant: u.is_etudiant, password_hash: u.password_hash,
        }),
      });
      if (resp.ok) {
        db.prepare('UPDATE users SET synced = 1 WHERE id = ?').run(u.id);
        usersSynced++;
      } else {
        errors.push('user ' + u.local_uid + ': HTTP ' + resp.status);
      }
    } catch (e) {
      errors.push('user ' + u.local_uid + ': ' + e.message);
    }
  }

  for (const l of pendingLoans) {
    try {
      const resp = await fetch(SITE_URL + '/api/sync/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sync-secret': SYNC_SECRET },
        body: JSON.stringify({
          local_uid: l.local_uid, book_uid: l.book_uid, statut: l.statut,
          duree_jours: l.duree_jours, date_demande: l.date_demande,
          user_local_uid: l.user_local_uid,
          user_fallback: { nom: l.u_nom, prenom: l.u_prenom, numero: l.u_numero, email: l.u_email,
            etablissement: l.u_etablissement, niveau: l.u_niveau, is_etudiant: l.u_is_etudiant,
            password_hash: l.u_password_hash },
        }),
      });
      if (resp.ok) {
        db.prepare('UPDATE loans SET synced = 1 WHERE id = ?').run(l.id);
        loansSynced++;
      } else {
        errors.push('loan ' + l.local_uid + ': HTTP ' + resp.status);
      }
    } catch (e) {
      errors.push('loan ' + l.local_uid + ': ' + e.message);
    }
  }

  return { ok: errors.length === 0, usersSynced, loansSynced, errors };
}

app.post('/api/sync', async (req, res) => {
  const admin = getAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Acces reserve aux administrateurs.' });
  const result = await runSync();
  res.json(result);
});

app.get('/api/sync/status', async (req, res) => {
  const pendingUsers = db.prepare('SELECT COUNT(*) as c FROM users WHERE synced = 0').get().c;
  const pendingLoans = db.prepare('SELECT COUNT(*) as c FROM loans WHERE synced = 0').get().c;
  const online = await pingOnlineServer();
  res.json({ online, pendingUsers, pendingLoans });
});

// Detection automatique de la reconnexion : verifie toutes les 2 minutes
// si Internet est revenu, et lance la synchronisation automatiquement.
let autoSyncInFlight = false;
setInterval(async () => {
  if (autoSyncInFlight) return;
  autoSyncInFlight = true;
  try {
    const status = await pingOnlineServer();
    if (status) {
      const pending = db.prepare('SELECT COUNT(*) as c FROM users WHERE synced = 0').get().c
        + db.prepare('SELECT COUNT(*) as c FROM loans WHERE synced = 0').get().c;
      if (pending > 0) {
        const result = await runSync();
        console.log('[sync auto] ' + JSON.stringify(result));
      }
    }
  } catch (e) {
    console.log('[sync auto] erreur: ' + e.message);
  } finally {
    autoSyncInFlight = false;
  }
}, 120000);

app.listen(PORT, () => {
console.log('========================================');
console.log(' Catalogue+ - Serveur local de secours');
console.log(' En ecoute sur http://localhost:' + PORT);
console.log(' Partagez cette adresse sur le reseau Wi-Fi de la bibliotheque.');
console.log('========================================');
});
