import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize, parse } from 'cookie';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'catalogueplus_session';
const ADMIN_COOKIE_NAME = 'catalogueplus_admin_session';
export async function hashPassword(p) { return bcrypt.hash(p, 12); }
export async function verifyPassword(p, h) { return bcrypt.compare(p, h); }
export function signUserToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); }
export function signAdminToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' }); }
export function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch (e) { return null; } }
export function setUserCookie(res, token) { res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 2592000 })); }
export function setAdminCookie(res, token) { res.setHeader('Set-Cookie', serialize(ADMIN_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 43200 })); }
export function clearUserCookie(res) { res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', { path: '/', maxAge: -1 })); }
export function clearAdminCookie(res) { res.setHeader('Set-Cookie', serialize(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: -1 })); }
export function getUserFromReq(req) { const c = parse(req.headers.cookie || ''); const t = c[COOKIE_NAME]; if (!t) return null; return verifyToken(t); }
export function getAdminFromReq(req) { const c = parse(req.headers.cookie || ''); const t = c[ADMIN_COOKIE_NAME]; if (!t) return null; const d = verifyToken(t); if (!d || d.role !== 'admin') return null; return d; }
