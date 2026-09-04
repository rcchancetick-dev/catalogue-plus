import sql from '../../../lib/db';
import { verifyPassword, signAdminToken, setAdminCookie } from '../../../lib/auth';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const { email, password, secretCode } = req.body;
    if (secretCode !== (process.env.ADMIN_ACCESS_CODE || 'ESPA2A')) return res.status(403).json({ error: "Code d'acces administrateur incorrect." });
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    const r = await sql`SELECT * FROM admins WHERE email = ${email.toLowerCase().trim()}`;
    if (r.length === 0) return res.status(401).json({ error: 'Identifiants incorrects.' });
    const admin = r[0];
    if (!admin.is_active) return res.status(403).json({ error: 'Compte desactive.' });
    if (!(await verifyPassword(password, admin.password_hash))) return res.status(401).json({ error: 'Identifiants incorrects.' });
    setAdminCookie(res, signAdminToken({ id: admin.id, email: admin.email, role: 'admin', adminRole: admin.role }));
    await sql`INSERT INTO activity_log (type_action, description, admin_id) VALUES ('connexion_admin', ${'Connexion de ' + admin.prenom + ' ' + admin.nom}, ${admin.id})`;
    return res.status(200).json({ message: 'Connexion reussie.', admin: { id: admin.id, nom: admin.nom, prenom: admin.prenom, email: admin.email, role: admin.role } });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur serveur.' }); }
}
