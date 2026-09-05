import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const typeIcons = {
  nouvelle_demande: 'mail',
  emprunt_valide: 'check-circle',
  emprunt_refuse: 'x',
  retard: 'alert-triangle'
};

export default function NotificationBell({ scope }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { clearInterval(interval); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) { console.warn('Notifications: reponse non-ok', res.status); return; }
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) { console.error('Erreur chargement notifications:', e); }
  }

  async function markAsRead(id) {
    await fetch('/api/notifications', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) });
    load();
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "a l'instant";
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    return Math.floor(diff / 86400) + ' j';
  }

  return (
    <div className="notif-bell-wrapper" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Icon name={unreadCount > 0 ? 'bell-ring' : 'bell'} size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="notif-panel" initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }} transition={{ duration: 0.18 }}>
            <div className="notif-panel-header">
              <span>Notifications</span>
              {unreadCount > 0 && <button onClick={markAllRead}>Tout marquer lu</button>}
            </div>
            <div className="notif-panel-list">
              {notifications.length === 0 ? (
                <p className="notif-empty">Aucune notification pour le moment.</p>
              ) : notifications.map((n) => (
                <div key={n.id} className={'notif-item' + (n.is_read ? '' : ' unread')} onClick={() => !n.is_read && markAsRead(n.id)}>
                  <div className="notif-item-icon"><Icon name={typeIcons[n.type] || 'bell'} size={16} /></div>
                  <div className="notif-item-body">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{timeAgo(n.created_at)}</small>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
