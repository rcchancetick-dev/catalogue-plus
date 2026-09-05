import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCard from '../components/BookCard';

export default function Catalogue() {
  const [user, setUser] = useState(null); const [books, setBooks] = useState([]);
  const [search, setSearch] = useState(''); const [categorie, setCategorie] = useState(''); const [loading, setLoading] = useState(true);
  const paramsRef = useRef({});

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
    loadBooks();
    const interval = setInterval(() => loadBooks(paramsRef.current, true), 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadBooks(params = {}, silent = false) {
    paramsRef.current = params;
    if (!silent) setLoading(true);
    const q = new URLSearchParams(params).toString();
    try { const res = await fetch('/api/books' + (q ? '?' + q : '')); const data = await res.json(); setBooks(data.books || []); }
    catch (e) { const cached = localStorage.getItem('catalogueplus_books_cache'); if (cached) setBooks(JSON.parse(cached)); }
    if (!silent) setLoading(false);
  }

  useEffect(() => { if (books.length > 0) localStorage.setItem('catalogueplus_books_cache', JSON.stringify(books)); }, [books]);
  function handleSearch(e) { e.preventDefault(); loadBooks({ search, categorie }); }
  async function handleLogout() { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); }
  const categories = ['Informatique','Mathematiques','Physique','Genie Civil','Electronique','Litterature','Sciences Humaines','Economie & Gestion'];
  return (
    <>
      <Head><title>Catalogue des livres | Catalogue+</title></Head>
      <Navbar user={user} onLogout={handleLogout} />
      <section className="page-header"><h1>Catalogue des livres</h1><p>Recherchez un ouvrage par titre, auteur ou categorie. Mise a jour automatique.</p></section>
      <section className="section">
        <form className="search-bar" onSubmit={handleSearch}>
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}><option value="">Toutes categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button type="submit" className="btn-primary">Rechercher</button>
        </form>
        {loading ? <p className="loading-text">Chargement...</p> : books.length === 0 ? <p className="loading-text">Aucun livre trouve.</p> : <div className="books-grid">{books.map((b, i) => <BookCard book={b} index={i} key={b.id} />)}</div>}
      </section>
      <Footer />
    </>
  );
}
