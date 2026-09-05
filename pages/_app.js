import '../styles/globals.css';
import '../styles/password-field.css';
import '../styles/responsive-fixes.css';
import { useEffect } from 'react';
export default function App({ Component, pageProps }) {
  useEffect(() => { if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }, []);
  return <Component {...pageProps} />;
}
