// Migration : ajoute les colonnes necessaires a la synchronisation offline
// (local_uid + synced) sur les tables users et loans, si elles n'existent pas
// deja. Sans danger a relancer plusieurs fois (IF NOT EXISTS).
// Usage : node scripts/migrate-sync-columns.js

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS local_uid TEXT UNIQUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT true`;
  await sql`ALTER TABLE loans ADD COLUMN IF NOT EXISTS local_uid TEXT UNIQUE`;
  await sql`ALTER TABLE loans ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT true`;
  console.log('Migration terminee : colonnes local_uid / synced disponibles sur users et loans.');
}

main().catch((e) => {
  console.error('Erreur de migration:', e);
  process.exit(1);
});
