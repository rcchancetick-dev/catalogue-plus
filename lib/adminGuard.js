import sql from './db';
import { getAdminFromReq } from './auth';

/**
 * Comme getAdminFromReq, mais verifie EN PLUS que le compte est toujours actif en base.
 * A utiliser dans toutes les routes sensibles pour empecher un admin desactive
 * de continuer a agir avec un cookie de session encore valide.
 */
export async function getActiveAdminFromReq(req) {
  const decoded = getAdminFromReq(req);
  if (!decoded) return null;
  try {
    const r = await sql`SELECT id, nom, prenom, email, role, is_active FROM admins WHERE id = ${decoded.id}`;
    if (r.length === 0 || !r[0].is_active) return null;
    return { ...decoded, adminRole: r[0].role };
  } catch (e) {
    return null;
  }
}
