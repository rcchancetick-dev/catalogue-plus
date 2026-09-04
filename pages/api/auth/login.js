import sql from '../../../lib/db';
import { verifyPassword, signUserToken, setUserCookie } from '../../../lib/auth';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    const r = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`;
    if (r.length === 0) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    const user = r[0];
    if (!user.is_active) return res.status(403).json({ error: 'Ce compte a ete desactive.' });
    if (!(await verifyPassword(password, user.password_hash))) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    setUserCookie(res, signUserToken({ id: user.id, email: user.email, role: 'user' }));
    return res.status(200).json({ message: 'Connexion reussie.', user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur lors de la connexion.' }); }
}
