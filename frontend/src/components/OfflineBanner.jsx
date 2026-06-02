import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

/**
 * OfflineBanner — shown at the bottom of the screen when the
 * browser loses network connectivity. Disappears automatically
 * when connection is restored.
 */
export default function OfflineBanner() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="offline-banner"
    >
      📡 {t.common.offlineBanner}
    </div>
  );
}
