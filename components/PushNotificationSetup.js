import { useEffect, useState } from 'react';
import Icon from './Icon';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushNotificationSetup() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setStatus('unsupported'); return; }
    if (Notification.permission === 'denied') { setStatus('denied'); return; }
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    setStatus(existing ? 'subscribed' : 'unsubscribed');
  }

  async function enablePush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) { setStatus('unsupported'); return; }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus('denied'); return; }
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      setStatus('subscribed');
    } catch (e) {
      console.error('Erreur activation push:', e);
      setStatus('unsubscribed');
    }
  }

  if (status === 'checking' || status === 'unsupported' || status === 'subscribed') return null;

  return (
    <div className="push-setup-banner">
      <Icon name="bell-ring" size={18} />
      <span>Recevez une alerte meme site ferme (nouvelle demande, validation, retard).</span>
      <button onClick={enablePush}>Activer</button>
    </div>
  );
}
