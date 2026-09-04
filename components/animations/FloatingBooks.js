import { motion } from 'framer-motion';
const icons = ['📘','📗','📙','📕','📖'];
export default function FloatingBooks() {
  return (<div className="floating-books" aria-hidden="true">{icons.map((icon, i) => (<motion.span key={i} className="floating-book" style={{ left: (i*19+5)+'%' }} initial={{ y: 60, opacity: 0, rotate: -10 }} animate={{ y: [60,-20,60], opacity: [0,1,0.7,1,0], rotate: [-10,8,-10] }} transition={{ duration: 8+i, repeat: Infinity, delay: i*1.1, ease: 'easeInOut' }}>{icon}</motion.span>))}</div>);
}
