import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Toast from '../../components/Toast';
import Icon from '../../components/Icon';
import PasswordInput from '../../components/PasswordInput';
import AnimatedButton from '../../components/animations/AnimatedButton';
export default function AdminSetup() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', setupCode: '' }); const [loading, setLoading] = useState(false); const [toast, setToast] = useState(''); const [toastType, setToastType] = useState('info');
  function showToast(msg, type = 'info') { setToastType(type); setToast(msg); setTimeout(() => setToast(''), 5000); }
  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
    try { const res = await fetch('/api/auth/setup-first-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setTimeout(() => router.push('/admin/connexion'), 1200); } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  }
  return (
    <>
      <Head><title>Configuration initiale | Catalogue+</title><meta name="robots" content="noindex, nofollow" /></Head>
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      <section className="admin-login-section">
        <motion.div className="admin-login-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="admin-login-icon"><Icon name="settings" size={40} /></div><h1>Configuration initiale</h1><p>Cette page ne fonctionne qu'une seule fois, tant qu'aucun admin n'existe.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row"><div><label>Nom</label><input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div><div><label>Prenom</label><input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div></div>
            <label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label>Mot de passe</label><PasswordInput required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label>Code de configuration</label><PasswordInput required value={form.setupCode} onChange={(e) => setForm({ ...form, setupCode: e.target.value })} placeholder="ADMIN_SETUP_CODE" />
            <AnimatedButton type="submit" className="btn-primary btn-full" disabled={loading}>{loading ? 'Creation...' : 'Creer le super-admin'}</AnimatedButton>
          </form>
        </motion.div>
      </section>
    </>
  );
}
