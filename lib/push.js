import sql from './db';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

let webpushModule = null;
let vapidConfigured = false;

async function getWebPush() {
  if (webpushModule) return webpushModule;
  try {
    const mod = await import('web-push');
    webpushModule = mod.default || mod;
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && !vapidConfigured) {
      webpushModule.setVapidDetails('mailto:contact@espa.mg', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      vapidConfigured = true;
    }
    return webpushModule;
  } catch (e) {
    return null;
  }
}

export async function sendPushToRecipient(recipientType, recipientId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  try {
    const webpush = await getWebPush();
    if (!webpush) return;
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
    const webpush = await getWebPush();
    if (!webpush) return;
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
