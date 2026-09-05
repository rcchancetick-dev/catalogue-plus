import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const statusLabels = { en_attente: { label: 'En attente de validation', cls: 'status-pending' }, en_cours: { label: 'Emprunt en cours', cls: 'status-active' }, refuse: { label: 'Demande refusee', cls: 'status-rejected' }, retourne: { label: 'Livre rendu', cls: 'status-returned' } };
export default function MesEmprunts() {
  const router = useRouter(); const [user, setUser] = useState(null); const [loans, setLoans] = useState([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/connexion?redirect=/mes-emprunts'); return; }
      setUser(d.user);
      loadLoans();
    });
    const interval = setInterval(() => loadLoans(true), 8000);
    return () => clearInterval(interval);
  }, []);

  async function loadLoans(silent = false) {
    try {
      const res = await fetch('/api/loans');
      const data = await res.json();
      setLoans((prev) => {
        const next = data.loans || [];
        if (silent && JSON.stringify(prev) === JSON.stringify(next)) return prev;
        return next;
      });
    } catch (e) {}
    if (!silent) setLoading(false);
  }

  async function handleLogout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }

  return (
    <>
      <Head><title>Mes emprunts | Catalogue+</title></Head>
      <Navbar user={user} onLogout={handleLogout} />
      <section className="page-header"><h1>Mes emprunts</h1><p>Historique et suivi de vos demandes. Mise a jour automatique.</p></section>
      <section className="section">
        {loading ? <p className="loading-text">Chargement...</p> : loans.length === 0 ? <p className="loading-text">Aucune demande.</p> : (
          <div className="loans-list">
            <AnimatePresence>
              {loans.map((l, i) => (
                <motion.div key={l.id} className="loan-item" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }}>
                  <div className="loan-item-main"><h3>{l.livre_titre}</h3><p>{l.livre_auteur}</p></div>
                  <div className="loan-item-status"><span className={'status-badge ' + (statusLabels[l.statut]?.cls || '')}>{statusLabels[l.statut]?.label || l.statut}</span>{l.statut === 'en_cours' && l.date_retour_prevue && <p className="loan-return-date">Retour prevu : {new Date(l.date_retour_prevue).toLocaleDateString('fr-FR')}</p>}{l.statut === 'refuse' && l.motif_refus && <p className="loan-motif">Motif : {l.motif_refus}</p>}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
