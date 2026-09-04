import { motion, AnimatePresence } from 'framer-motion';
export default function Toast({ message, type = 'info', onClose }) {
  return (<AnimatePresence>{message && <motion.div className={'toast toast-' + type} initial={{ opacity: 0, y: -40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={onClose}>{message}</motion.div>}</AnimatePresence>);
}
