import sql from '../../../lib/db';
import { hashPassword, signUserToken, setUserCookie } from '../../../lib/auth';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const { nom, prenom, numero, email, etablissement, niveau, is_etudiant, password, confirmPassword } = req.body;
    if (!nom || !prenom || !numero || !email || !password || !confirmPassword) return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires.' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    if (password.length < 8) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caracteres.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Adresse email invalide.' });
    const ex = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
    if (ex.length > 0) return res.status(409).json({ error: 'Un compte existe deja avec cet email.' });
    const hash = await hashPassword(password);
    const r = await sql`INSERT INTO users (nom, prenom, numero, email, etablissement, niveau, is_etudiant, password_hash) VALUES (${nom.trim()}, ${prenom.trim()}, ${numero.trim()}, ${email.toLowerCase().trim()}, ${etablissement || null}, ${niveau || null}, ${is_etudiant !== false}, ${hash}) RETURNING id, nom, prenom, email`;
    const user = r[0];
    setUserCookie(res, signUserToken({ id: user.id, email: user.email, role: 'user' }));
    return res.status(201).json({ message: 'Inscription reussie ! Bienvenue sur Catalogue+.', user });
  } catch (e) { console.error(e); return res.status(500).json({ error: "Erreur lors de l'inscription." }); }
}
