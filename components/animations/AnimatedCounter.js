import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
export default function AnimatedCounter({ value = 0, label = '', suffix = '' }) {
  const ref = useRef(null); const isInView = useInView(ref, { once: true }); const [count, setCount] = useState(0);
  useEffect(() => { if (!isInView) return; const end = Number(value) || 0; if (end === 0) return; const duration = 1200; const start = performance.now();
    function tick(now) { const p = Math.min((now-start)/duration, 1); const eased = 1 - Math.pow(1-p, 3); setCount(Math.floor(eased*end)); if (p < 1) requestAnimationFrame(tick); else setCount(end); }
    requestAnimationFrame(tick); }, [isInView, value]);
  return <motion.div ref={ref} className="stat-counter"><div className="stat-counter-value">{count}{suffix}</div><div className="stat-counter-label">{label}</div></motion.div>;
}
