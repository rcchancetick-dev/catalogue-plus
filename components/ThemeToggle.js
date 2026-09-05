import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('catalogueplus_theme');
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('catalogueplus_theme', next);
  }

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
    >
      <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
      </motion.span>
    </motion.button>
  );
}
