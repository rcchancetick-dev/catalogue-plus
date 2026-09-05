import sql from './db';

export async function notifyAdmins({ type, title, message, loanId = null, bookId = null }) {
  const admins = await sql`SELECT id FROM admins WHERE is_active = true`;
  for (const a of admins) {
    await sql`INSERT INTO notifications (recipient_type, recipient_id, type, title, message, loan_id, book_id) VALUES ('admin', ${a.id}, ${type}, ${title}, ${message}, ${loanId}, ${bookId})`;
  }
}

export async function notifyUser({ userId, type, title, message, loanId = null, bookId = null }) {
  await sql`INSERT INTO notifications (recipient_type, recipient_id, type, title, message, loan_id, book_id) VALUES ('user', ${userId}, ${type}, ${title}, ${message}, ${loanId}, ${bookId})`;
}
