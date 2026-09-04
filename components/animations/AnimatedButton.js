import { motion } from 'framer-motion';
export default function AnimatedButton({ children, className = '', ...props }) { return <motion.button className={className} whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} {...props}>{children}</motion.button>; }
