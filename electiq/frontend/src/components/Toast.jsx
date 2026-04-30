import React, { useState, useEffect } from 'react';

export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('add-toast', { detail: { type: 'success', message: msg } })),
  error: (msg) => window.dispatchEvent(new CustomEvent('add-toast', { detail: { type: 'error', message: msg } })),
  info: (msg) => window.dispatchEvent(new CustomEvent('add-toast', { detail: { type: 'info', message: msg } }))
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAdd = (e) => {
      const newToast = { id: Date.now(), ...e.detail };
      setToasts(prev => [...prev, newToast].slice(-3)); // Max 3 visible
    };
    window.addEventListener('add-toast', handleAdd);
    return () => window.removeEventListener('add-toast', handleAdd);
  }, []);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .toast-enter { animation: slideInRight 0.3s ease-out forwards; }
      `}</style>
      {toasts.map(t => (
        <div key={t.id} className={`toast-enter px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 text-sm font-medium bg-white pointer-events-auto
          ${t.type === 'success' ? 'border-green-500 text-green-700' : ''}
          ${t.type === 'error' ? 'border-red-500 text-red-700' : ''}
          ${t.type === 'info' ? 'border-[#378ADD] text-[#378ADD]' : ''}
        `}>
          {t.type === 'success' && <span>✓</span>}
          {t.type === 'error' && <span>✗</span>}
          {t.type === 'info' && <span>ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}
