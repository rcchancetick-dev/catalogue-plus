const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = new Database(path.join(__dirname, 'data', 'catalogueplus.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prenom TEXT NOT NULL, numero TEXT NOT NULL, email TEXT UNIQUE NOT NULL, etablissement TEXT, niveau TEXT, is_etudiant INTEGER DEFAULT 1, password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_active INTEGER DEFAULT 1);
  CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prenom TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_active INTEGER DEFAULT 1);
  CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT UNIQUE NOT NULL, titre TEXT NOT NULL, auteur TEXT NOT NULL, isbn TEXT, editeur TEXT, annee_publication INTEGER, categorie TEXT, langue TEXT DEFAULT 'Francais', nombre_pages INTEGER, description TEXT, couverture_url TEXT, emplacement TEXT, nombre_exemplaires INTEGER DEFAULT 1, exemplaires_disponibles INTEGER DEFAULT 1, statut TEXT DEFAULT 'disponible', qr_code_data TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS loans (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, book_id INTEGER, statut TEXT DEFAULT 'en_attente', date_demande TEXT DEFAULT CURRENT_TIMESTAMP, duree_jours INTEGER DEFAULT 14, date_validation TEXT, date_emprunt TEXT, date_retour_prevue TEXT, date_retour_effective TEXT, motif_refus TEXT, valide_par INTEGER, synced INTEGER DEFAULT 0);
`);
const adminEmail = 'admin@espa.mg';
const exists = db.prepare('SELECT id FROM admins WHERE email = ?').get(adminEmail);
if (!exists) {
  const hash = bcrypt.hashSync('Admin@2026', 12);
  db.prepare('INSERT INTO admins (nom, prenom, email, password_hash, role) VALUES (?,?,?,?,?)').run('Administrateur', 'Local', adminEmail, hash, 'super_admin');
  console.log('Admin local cree: admin@espa.mg / Admin@2026');
}
console.log('Base SQLite locale initialisee dans offline-server/data/catalogueplus.db');
