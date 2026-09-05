import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import PasswordInput from '../components/PasswordInput';
import AnimatedButton from '../components/animations/AnimatedButton';
export default function Connexion() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); const [toast, setToast] = useState(''); const [toastType, setToastType] = useState('info'); const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ nom: '', prenom: '', numero: '', email: '', etablissement: '', niveau: '', is_etudiant: true, password: '', confirmPassword: '' });
  function showToast(msg, type = 'info') { setToastType(type); setToast(msg); setTimeout(() => setToast(''), 4000); }
  function handleEtudiantToggle(checked) {
    setRegForm({ ...regForm, is_etudiant: checked, etablissement: checked ? regForm.etablissement : '', niveau: checked ? regForm.niveau : '' });
  }
  async function handleLogin(e) {
    e.preventDefault(); setLoading(true);
    try { const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setTimeout(() => router.push(router.query.redirect || '/catalogue'), 800); } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  }
  async function handleRegister(e) {
    e.preventDefault(); setLoading(true);
    try { const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regForm) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setTimeout(() => router.push(router.query.redirect || '/catalogue'), 800); } catch (err) { showToast(err.message, 'error'); }
    setLoading(false);
  }
  return (
    <>
      <Head><title>Connexion / Inscription | Catalogue+</title></Head>
      <Navbar user={null} onLogout={() => {}} />
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      <section className="auth-section">
        <motion.div className="auth-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Connexion</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Inscription</button></div>
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="auth-form">
                <label>Email</label><input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                <label>Mot de passe</label><PasswordInput required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                <AnimatedButton type="submit" className="btn-primary btn-full" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</AnimatedButton>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="auth-form">
                <div className="form-row"><div><label>Nom</label><input required value={regForm.nom} onChange={(e) => setRegForm({ ...regForm, nom: e.target.value })} /></div><div><label>Prenom</label><input required value={regForm.prenom} onChange={(e) => setRegForm({ ...regForm, prenom: e.target.value })} /></div></div>
                <label>Numero de telephone</label><input required value={regForm.numero} onChange={(e) => setRegForm({ ...regForm, numero: e.target.value })} />
                <label>Email</label><input type="email" required value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                <div className="form-row"><div className="checkbox-row"><input type="checkbox" checked={regForm.is_etudiant} onChange={(e) => handleEtudiantToggle(e.target.checked)} id="is_etudiant" /><label htmlFor="is_etudiant">Je suis etudiant(e)</label></div></div>
                <AnimatePresence>
                  {regForm.is_etudiant && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                      <label>Etablissement</label><input required={regForm.is_etudiant} value={regForm.etablissement} onChange={(e) => setRegForm({ ...regForm, etablissement: e.target.value })} placeholder="Ex: ESPA Antsiranana" />
                      <label>Niveau d'etudes</label><input required={regForm.is_etudiant} value={regForm.niveau} onChange={(e) => setRegForm({ ...regForm, niveau: e.target.value })} placeholder="Ex: Licence 2" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <label>Mot de passe</label><PasswordInput required minLength={8} value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                <label>Confirmer le mot de passe</label><PasswordInput required minLength={8} value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} />
                <AnimatedButton type="submit" className="btn-primary btn-full" disabled={loading}>{loading ? 'Inscription...' : "S'inscrire"}</AnimatedButton>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
