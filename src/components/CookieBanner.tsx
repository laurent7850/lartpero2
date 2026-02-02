import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white p-6 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            Nous utilisons des cookies essentiels pour assurer le bon fonctionnement
            de notre site. Aucun cookie de tracking publicitaire n'est utilisé.{' '}
            <a href="/confidentialite" className="underline hover:text-white/80">
              En savoir plus
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={rejectCookies}
            className="bg-transparent text-white border-white hover:bg-white hover:text-black"
          >
            Refuser
          </Button>
          <Button
            size="sm"
            onClick={acceptCookies}
            className="bg-white text-black hover:bg-white/90"
          >
            Accepter
          </Button>
          <button
            onClick={rejectCookies}
            className="p-2 hover:opacity-60 transition-opacity"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
