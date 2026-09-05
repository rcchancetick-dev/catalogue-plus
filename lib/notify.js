import sql from './db';
import { sendPushToRecipient, sendPushToAllAdmins } from './push';

export async function notifyAdmins({ type, title, message, loanId = null, bookId = null }) {
  try {
    const admins = await sql`SELECT id FROM admins WHERE is_active = true`;
    for (const a of admins) {
      await sql`INSERT INTO notifications (recipient_type, recipient_id, type, title, message, loan_id, book_id) VALUES ('admin', ${a.id}, ${type}, ${title}, ${message}, ${loanId}, ${bookId})`;
    }
    sendPushToAllAdmins({ title, body: message, url: '/admin/dashboard', type }).catch(() => {});
  } catch (e) {
    console.error('Erreur notifyAdmins (non bloquant):', e);
  }
}

export async function notifyUser({ userId, type, title, message, loanId = null, bookId = null }) {
  try {
    await sql`INSERT INTO notifications (recipient_type, recipient_id, type, title, message, loan_id, book_id) VALUES ('user', ${userId}, ${type}, ${title}, ${message}, ${loanId}, ${bookId})`;
    sendPushToRecipient('user', userId, { title, body: message, url: '/mes-emprunts', type }).catch(() => {});
  } catch (e) {
    console.error('Erreur notifyUser (non bloquant):', e);
  }
}
