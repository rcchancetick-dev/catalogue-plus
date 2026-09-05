import sql from '../../../lib/db';
import { getUserFromReq } from '../../../lib/auth';
import { getActiveAdminFromReq } from '../../../lib/adminGuard';

export default async function handler(req, res) {
  const user = getUserFromReq(req);
  const admin = await getActiveAdminFromReq(req);
  const recipientType = admin ? 'admin' : (user ? 'user' : null);
  const recipientId = admin ? admin.id : (user ? user.id : null);
  if (!recipientType) return res.status(401).json({ error: 'Non autorise.' });

  if (req.method === 'GET') {
    try {
      const notifs = await sql`SELECT * FROM notifications WHERE recipient_type = ${recipientType} AND recipient_id = ${recipientId} ORDER BY created_at DESC LIMIT 30`;
      const unread = await sql`SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_type = ${recipientType} AND recipient_id = ${recipientId} AND is_read = false`;
      return res.status(200).json({ notifications: notifs, unreadCount: unread[0].count });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, markAll } = req.body;
      if (markAll) {
        await sql`UPDATE notifications SET is_read = true WHERE recipient_type = ${recipientType} AND recipient_id = ${recipientId} AND is_read = false`;
        return res.status(200).json({ message: 'Toutes les notifications marquees comme lues.' });
      }
      if (!id) return res.status(400).json({ error: 'ID de notification requis.' });
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND recipient_type = ${recipientType} AND recipient_id = ${recipientId}`;
      return res.status(200).json({ message: 'Notification marquee comme lue.' });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Erreur.' }); }
  }

  return res.status(405).json({ error: 'Methode non autorisee' });
}
