import webpush from 'web-push';
import sql from './db';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:contact@espa.mg', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendPushToRecipient(recipientType, recipientId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  try {
    const subs = await sql`SELECT * FROM push_subscriptions WHERE recipient_type = ${recipientType} AND recipient_id = ${recipientId}`;
    for (const sub of subs) {
      const subscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
        }
      }
    }
  } catch (e) { console.error('Erreur envoi push:', e); }
}

export async function sendPushToAllAdmins(payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  try {
    const subs = await sql`SELECT * FROM push_subscriptions WHERE recipient_type = 'admin'`;
    for (const sub of subs) {
      const subscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
        }
      }
    }
  } catch (e) { console.error('Erreur envoi push admins:', e); }
}
