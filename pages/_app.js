import '../styles/globals.css';
import '../styles/password-field.css';
import '../styles/responsive-fixes.css';
import '../styles/dark-theme.css';
import '../styles/navbar-mobile-actions.css';
import '../styles/notifications.css';
import '../styles/push-banner.css';
import '../styles/navbar-admin-button.css';
import '../styles/confirm-modal.css';
import '../styles/footer-admin-link.css';
import '../styles/admin-view-site-button.css';
import '../styles/admin-mobile-complete.css';
import '../styles/notif-mobile-fix.css';
import '../styles/notif-text-wrap-fix.css';
import '../styles/notif-viewport-fix.css';
import { useEffect } from 'react';
export default function App({ Component, pageProps }) {
  useEffect(() => {
    const saved = localStorage.getItem('catalogueplus_theme');
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initial);
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }, []);
  return <Component {...pageProps} />;
}
