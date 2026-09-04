import { clearAdminCookie } from '../../../lib/auth';
export default async function handler(req, res) { if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' }); clearAdminCookie(res); return res.status(200).json({ message: 'Deconnexion reussie.' }); }
