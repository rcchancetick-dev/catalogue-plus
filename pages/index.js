import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import FadeInSection from '../components/animations/FadeInSection';
import AnimatedButton from '../components/animations/AnimatedButton';
import FloatingBooks from '../components/animations/FloatingBooks';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import BookCard from '../components/BookCard';

export default function Home() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [online, setOnline] = useState(true);
  const [logoClicks, setLogoClicks] = useState(0);
  function handleLogoSecretClick() {
    setLogoClicks((c) => { const next = c + 1; if (next >= 5) { window.location.href = '/admin/connexion'; return 0; } setTimeout(() => setLogoClicks(0), 2000); return next; });
  }
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
    fetch('/api/books').then(r => r.json()).then(d => setBooks((d.books || []).slice(0, 6))).catch(() => {});
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  async function handleLogout() { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); }
  return (
    <>
      <Head><title>Catalogue+ | Catalogue numerique de bibliotheque par QR Code</title></Head>
      <Navbar user={user} onLogout={handleLogout} />
      {!online && <div className="offline-banner"><Icon name="alert-triangle" size={16} /> Vous etes hors-ligne. Connectez-vous au Wi-Fi local de la bibliotheque pour continuer.</div>}
      <section className="hero">
        <FloatingBooks />
        <span onClick={handleLogoSecretClick} className="hidden-admin-trigger" aria-hidden="true" />
        <motion.div className="hero-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}>
          <span className="hero-badge"><Icon name="graduation-cap" size={16} /> Mini-projet ESPA — 2eme annee</span>
          <h1>Scannez. Decouvrez. <span className="text-gradient">Empruntez.</span></h1>
          <p className="hero-subtitle">Catalogue+ transforme chaque livre de votre bibliotheque en fiche numerique accessible en un scan de QR code.</p>
          <div className="hero-actions"><Link href="/catalogue"><AnimatedButton className="btn-primary">Explorer le catalogue</AnimatedButton></Link><Link href="/#comment-ca-marche"><AnimatedButton className="btn-secondary">Comment ca marche ?</AnimatedButton></Link></div>
        </motion.div>
      </section>
      <section className="stats-section"><div className="stats-grid">
        <AnimatedCounter value={books.length ? books.length*40 : 200} suffix="+" label="Livres references" />
        <AnimatedCounter value={98} suffix="%" label="Satisfaction utilisateurs" />
        <AnimatedCounter value={24} suffix="/24" label="Acces au catalogue" />
        <AnimatedCounter value={2} label="Modes: en ligne & hors-ligne" />
      </div></section>
      <section className="section" id="comment-ca-marche">
        <FadeInSection><h2 className="section-title">Comment ca marche ?</h2><p className="section-subtitle">Un parcours simple pour etudiants et bibliothecaires.</p></FadeInSection>
        <div className="steps-grid">
          {[{ icon: 'smartphone', title: '1. Scannez le QR Code', text: "Chaque livre a une etiquette QR unique." },{ icon: 'book-open', title: '2. Consultez la fiche', text: "Titre, auteur, disponibilite instantanement." },{ icon: 'lock', title: '3. Connectez-vous', text: "Creez votre compte en 1 minute." },{ icon: 'mail', title: "4. Demandez l'emprunt", text: "L'administrateur valide ou refuse avec motif." }].map((s, i) => (
            <FadeInSection key={i} delay={i*0.1}><div className="step-card"><div className="step-icon"><Icon name={s.icon} size={32} /></div><h3>{s.title}</h3><p>{s.text}</p></div></FadeInSection>
          ))}
        </div>
      </section>
      {books.length > 0 && (<section className="section"><FadeInSection><h2 className="section-title">Livres recemment ajoutes</h2></FadeInSection><div className="books-grid">{books.map((b, i) => <BookCard book={b} index={i} key={b.id} />)}</div><div className="section-cta"><Link href="/catalogue"><AnimatedButton className="btn-primary">Voir tout le catalogue</AnimatedButton></Link></div></section>)}
      <section className="section trust-section" id="a-propos">
        <FadeInSection><h2 className="section-title">Pourquoi nous faire confiance ?</h2></FadeInSection>
        <div className="trust-grid">
          <FadeInSection delay={0.05}><div className="trust-card"><div className="trust-icon"><Icon name="shield-lock" size={28} /></div><h3>Donnees securisees</h3><p>Bcrypt, JWT, cookies HttpOnly. Vos donnees ne sont jamais exposees.</p></div></FadeInSection>
          <FadeInSection delay={0.1}><div className="trust-card"><div className="trust-icon"><Icon name="graduation-cap" size={28} /></div><h3>Projet academique transparent</h3><p>Developpe par des etudiants ESPA dans un cadre pedagogique supervise.</p></div></FadeInSection>
          <FadeInSection delay={0.15}><div className="trust-card"><div className="trust-icon"><Icon name="wifi" size={28} /></div><h3>Fonctionne hors-ligne</h3><p>Un serveur de secours a la bibliotheque prend le relais en cas de coupure.</p></div></FadeInSection>
          <FadeInSection delay={0.2}><div className="trust-card"><div className="trust-icon"><Icon name="check-circle" size={28} /></div><h3>Controle humain</h3><p>Chaque emprunt est valide manuellement par un administrateur.</p></div></FadeInSection>
        </div>
      </section>
      <Footer />
    </>
  );
}
