require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function init() {
  await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, numero VARCHAR(30) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, etablissement VARCHAR(150), niveau VARCHAR(50), is_etudiant BOOLEAN DEFAULT true, password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW(), is_active BOOLEAN DEFAULT true);`;
  await sql`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(30) DEFAULT 'admin', created_at TIMESTAMP DEFAULT NOW(), is_active BOOLEAN DEFAULT true);`;
  await sql`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, nom VARCHAR(100) UNIQUE NOT NULL);`;
  await sql`CREATE TABLE IF NOT EXISTS books (id SERIAL PRIMARY KEY, uid VARCHAR(40) UNIQUE NOT NULL, titre VARCHAR(250) NOT NULL, auteur VARCHAR(200) NOT NULL, isbn VARCHAR(50), editeur VARCHAR(150), annee_publication INTEGER, categorie VARCHAR(100), langue VARCHAR(50) DEFAULT 'Francais', nombre_pages INTEGER, description TEXT, couverture_url TEXT, emplacement VARCHAR(100), nombre_exemplaires INTEGER DEFAULT 1, exemplaires_disponibles INTEGER DEFAULT 1, statut VARCHAR(30) DEFAULT 'disponible', qr_code_data TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`;
  await sql`CREATE TABLE IF NOT EXISTS loans (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, book_id INTEGER REFERENCES books(id) ON DELETE CASCADE, statut VARCHAR(30) DEFAULT 'en_attente', date_demande TIMESTAMP DEFAULT NOW(), duree_jours INTEGER DEFAULT 14, date_validation TIMESTAMP, date_emprunt TIMESTAMP, date_retour_prevue DATE, date_retour_effective TIMESTAMP, motif_refus TEXT, valide_par INTEGER REFERENCES admins(id), notes TEXT, overdue_notified BOOLEAN DEFAULT false);`;
  await sql`CREATE TABLE IF NOT EXISTS activity_log (id SERIAL PRIMARY KEY, type_action VARCHAR(50) NOT NULL, description TEXT, admin_id INTEGER REFERENCES admins(id), user_id INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW());`;
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_type VARCHAR(10) NOT NULL,
    recipient_id INTEGER,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );`;
  await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    recipient_type VARCHAR(10) NOT NULL,
    recipient_id INTEGER NOT NULL,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );`;
  await sql`CREATE INDEX IF NOT EXISTS idx_books_uid ON books(uid);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(statut);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_type, recipient_id, is_read);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_push_sub_recipient ON push_subscriptions(recipient_type, recipient_id);`;
  console.log('Tables creees (incluant notifications et push_subscriptions).');
}
init().catch((e) => { console.error(e); process.exit(1); });
