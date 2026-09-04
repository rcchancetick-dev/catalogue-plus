import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Toast from '../../components/Toast';
import Icon from '../../components/Icon';
import AnimatedButton from '../../components/animations/AnimatedButton';
export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', secretCode: '' }); const [loading, setLoading] = useState(false); const [toast, setToast] = useState(''); const [toastType, setToastType] = useState('info');
  function showToast(msg, type = 'info') { setToastType(type); setToast(msg); setTimeout(() => setToast(''), 4500); }
  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
    try { const res = await fetch('/api/auth/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setTimeout(() => router.push('/admin/dashboard'), 700); } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  }
  return (
    <>
      <Head><title>Espace Administrateur | Catalogue+</title><meta name="robots" content="noindex, nofollow" /></Head>
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      <section className="admin-login-section">
        <motion.div className="admin-login-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="admin-login-icon"><Icon name="lock" size={40} /></div><h1>Espace Administrateur</h1><p>Acces reserve au personnel autorise de la bibliotheque.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>Email administrateur</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label>Mot de passe</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label>Code d'acces securite</label><input type="password" required value={form.secretCode} onChange={(e) => setForm({ ...form, secretCode: e.target.value })} placeholder="Code fourni par le responsable" />
            <AnimatedButton type="submit" className="btn-primary btn-full" disabled={loading}>{loading ? 'Verification...' : 'Se connecter'}</AnimatedButton>
          </form>
          <p className="admin-login-footer">Premiere utilisation ? <a href="/admin/setup">Configurer le super-admin</a></p>
        </motion.div>
      </section>
    </>
  );
}
