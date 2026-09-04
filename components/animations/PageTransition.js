import { motion } from 'framer-motion';
const v = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -24 } };
export default function PageTransition({ children }) { return <motion.div initial="initial" animate="animate" exit="exit" variants={v} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>{children}</motion.div>; }
