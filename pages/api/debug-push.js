import sql from '../../lib/db';

/**
 * ROUTE DE DIAGNOSTIC TEMPORAIRE - verifie l'etat des abonnements push
 * Accessible dans le navigateur: /api/debug-push
 */
export default async function handler(req, res) {
  try {
    const subs = await sql`SELECT id, recipient_type, recipient_id, endpoint, created_at FROM push_subscriptions ORDER BY created_at DESC`;
    const vapidConfigured = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

    return res.status(200).json({
      vapid_public_key_present: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      vapid_private_key_present: !!process.env.VAPID_PRIVATE_KEY,
      vapid_public_key_preview: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 15) + '...' : null,
      total_subscriptions: subs.length,
      subscriptions: subs.map(s => ({
        id: s.id,
        recipient_type: s.recipient_type,
        recipient_id: s.recipient_id,
        endpoint_preview: s.endpoint.substring(0, 60) + '...',
        created_at: s.created_at
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
