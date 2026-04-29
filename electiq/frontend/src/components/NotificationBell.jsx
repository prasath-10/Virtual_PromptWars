import React, { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = 'BN_1d-1T_dJFKYkJ9tlitGJ3gBs8_1hwj77WHvhI_C1Hq_4pOlPLXKL2WRhIaRSkyP9VssXbnAOxlaEAJJCwxmQ';

export default function NotificationBell({ country, electionDate }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleToggleSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }

    setLoading(true);
    try {
      if (isSubscribed) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });
        }
        setIsSubscribed(false);
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Permission not granted for notifications');
          setLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            country,
            electionDate
          })
        });

        setIsSubscribed(true);
        alert("You'll be reminded before election day!");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to update subscription');
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleToggleSubscription}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-300 ${isSubscribed ? 'text-amber-400 bg-amber-400/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
      title={isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to election reminders'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSubscribed ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </button>
  );
}
