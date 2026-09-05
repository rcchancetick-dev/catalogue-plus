import sql from '../../../lib/db';
import { getUserFromReq, getAdminFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = getUserFromReq(req);
  const admin = getAdminFromReq(req);
  const recipientType = admin ? 'admin' : (user ? 'user' : null);
  const recipientId = admin ? admin.id : (user ? user.id : null);
  if (!recipientType) return res.status(401).json({ error: 'Non autorise.' });

  if (req.method === 'POST') {
    try {
      const { subscription } = req.body;
      if (!subscription || !subscription.endpoint || !subscription.keys) return res.status(400).json({ error: 'Abonnement invalide.' });
      await sql`
        INSERT INTO push_subscriptions (recipient_type, recipient_id, endpoint, p256dh, auth)
        VALUES (${recipientType}, ${recipientId}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
        ON CONFLICT (endpoint) DO UPDATE SET recipient_type = ${recipientType}, recipient_id = ${recipientId}
      `;
      return res.status(201).json({ message: 'Abonnement aux notifications push enregistre.' });
    } catch (e) { console.error(e); return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'abonnement." }); }
  }

  if (req.method === 'DELETE') {
    try {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ error: 'Endpoint requis.' });
      await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND recipient_type = ${recipientType} AND recipient_id = ${recipientId}`;
      return res.status(200).json({ message: 'Desabonnement effectue.' });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur lors du desabonnement.' }); }
  }

  return res.status(405).json({ error: 'Methode non autorisee' });
}
