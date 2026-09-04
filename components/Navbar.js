import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand"><Icon name="book" size={24} className="brand-icon" /><span>Catalogue<span className="brand-plus">+</span></span></Link>
        <div className="navbar-links-desktop">
          <Link href="/catalogue">Catalogue</Link><Link href="/#a-propos">A propos</Link><Link href="/#contact">Contact</Link>
          {user ? (<div className="navbar-user"><span>Bonjour, {user.prenom}</span><Link href="/mes-emprunts" className="btn-nav-secondary">Mes emprunts</Link><button className="btn-nav-logout" onClick={onLogout}>Deconnexion</button></div>) : <Link href="/connexion" className="btn-nav-primary">Connexion</Link>}
        </div>
        <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
      </div>
      <AnimatePresence>
        {menuOpen && (<motion.div className="navbar-mobile" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
          <Link href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</Link><Link href="/#a-propos" onClick={() => setMenuOpen(false)}>A propos</Link><Link href="/#contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (<><Link href="/mes-emprunts" onClick={() => setMenuOpen(false)}>Mes emprunts</Link><button onClick={onLogout}>Deconnexion</button></>) : <Link href="/connexion" onClick={() => setMenuOpen(false)}>Connexion</Link>}
        </motion.div>)}
      </AnimatePresence>
    </nav>
  );
}
