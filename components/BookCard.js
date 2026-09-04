import Link from 'next/link';
import { motion } from 'framer-motion';
import Icon from './Icon';
export default function BookCard({ book, index = 0 }) {
  const dispo = book.exemplaires_disponibles > 0;
  return (
    <motion.div className="book-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.45, delay: Math.min(index*0.06, 0.4) }} whileHover={{ y: -8 }}>
      <div className="book-card-cover">{book.couverture_url ? <img src={book.couverture_url} alt={book.titre} /> : <div className="book-card-cover-placeholder"><Icon name="book-open" size={40} /></div>}<span className={'badge ' + (dispo ? 'badge-dispo' : 'badge-indispo')}>{dispo ? 'Disponible' : 'Emprunte'}</span></div>
      <div className="book-card-body"><h3>{book.titre}</h3><p className="book-card-author">{book.auteur}</p>{book.categorie && <span className="book-card-tag"><Icon name="tag" size={13} /> {book.categorie}</span>}<Link href={'/livre/' + book.uid} className="book-card-link">Voir la fiche →</Link></div>
    </motion.div>
  );
}
