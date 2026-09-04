import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Toast from '../../components/Toast';
import AnimatedButton from '../../components/animations/AnimatedButton';
export default function FicheLivre() {
  const router = useRouter(); const { uid } = router.query;
  const [book, setBook] = useState(null); const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(''); const [toastType, setToastType] = useState('info'); const [duree, setDuree] = useState(14); const [requesting, setRequesting] = useState(false);
  function showToast(msg, type = 'info') { setToastType(type); setToast(msg); setTimeout(() => setToast(''), 4500); }
  useEffect(() => {
    if (!uid) return;
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
    fetch('/api/books/' + uid).then(async (r) => { const data = await r.json(); if (!r.ok) setNotFound(true); else { setBook(data.book); localStorage.setItem('catalogueplus_book_' + uid, JSON.stringify(data.book)); } setLoading(false); })
      .catch(() => { const cached = localStorage.getItem('catalogueplus_book_' + uid); if (cached) setBook(JSON.parse(cached)); else setNotFound(true); setLoading(false); });
  }, [uid]);
  async function handleLogout() { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); }
  async function handleEmprunt() {
    if (!user) { router.push('/connexion?redirect=/livre/' + uid); return; }
    setRequesting(true);
    try { const res = await fetch('/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookUid: uid, dureeJours: duree }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); } catch (err) { showToast(err.message, 'error'); }
    setRequesting(false);
  }
  return (
    <>
      <Head><title>{book ? book.titre : 'Livre'} | Catalogue+</title></Head>
      <Navbar user={user} onLogout={handleLogout} />
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      <section className="section">
        {loading ? <p className="loading-text">Chargement...</p> : notFound ? (<div className="not-found-box"><h2>Livre introuvable</h2><p>Ce QR code ne correspond a aucun livre, ou vous etes hors-ligne sans cache.</p></div>) : (
          <motion.div className="book-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="book-detail-cover">{book.couverture_url ? <img src={book.couverture_url} alt={book.titre} /> : <div className="book-detail-cover-placeholder">📖</div>}</div>
            <div className="book-detail-info">
              <span className={'badge ' + (book.exemplaires_disponibles > 0 ? 'badge-dispo' : 'badge-indispo')}>{book.exemplaires_disponibles > 0 ? book.exemplaires_disponibles + ' exemplaire(s) disponible(s)' : 'Aucun exemplaire disponible'}</span>
              <h1>{book.titre}</h1><p className="book-detail-author">par {book.auteur}</p>
              <div className="book-detail-meta">
                {book.editeur && <span>📗 {book.editeur}</span>}{book.annee_publication && <span>📅 {book.annee_publication}</span>}{book.categorie && <span>🏷️ {book.categorie}</span>}{book.nombre_pages && <span>📄 {book.nombre_pages} pages</span>}{book.langue && <span>🌐 {book.langue}</span>}{book.emplacement && <span>📍 {book.emplacement}</span>}
              </div>
              {book.description && <p className="book-detail-desc">{book.description}</p>}
              {book.isbn && <p className="book-detail-isbn">ISBN : {book.isbn}</p>}
              <div className="emprunt-box">
                <h3>Demander un emprunt</h3>
                {!user && <p className="emprunt-note">Connectez-vous pour emprunter ce livre.</p>}
                <label>Duree souhaitee</label>
                <select value={duree} onChange={(e) => setDuree(e.target.value)}><option value={7}>7 jours</option><option value={14}>14 jours</option><option value={21}>21 jours</option><option value={30}>30 jours</option></select>
                <AnimatedButton className="btn-primary btn-full" onClick={handleEmprunt} disabled={requesting || book.exemplaires_disponibles <= 0}>{book.exemplaires_disponibles <= 0 ? 'Indisponible' : requesting ? 'Envoi...' : (user ? "Demander l'emprunt" : 'Se connecter pour emprunter')}</AnimatedButton>
              </div>
            </div>
          </motion.div>
        )}
      </section>
      <Footer />
    </>
  );
}
