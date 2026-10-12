import { useState, useEffect } from 'react';

const COOKIE_NAME = 'cookie_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    const stored = getCookie(COOKIE_NAME);
    if (!stored) {
      setVisible(true);
    } else {
      setConsent(stored === 'accepted' ? 'accepted' : 'declined');
    }
  }, []);

  const handleAccept = () => {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_MAX_AGE);
    setConsent('accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    setCookie(COOKIE_NAME, 'declined', COOKIE_MAX_AGE);
    setConsent('declined');
    setVisible(false);
  };

  const handleReset = () => {
    setCookie(COOKIE_NAME, '', -1);
    setConsent(null);
    setVisible(true);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[300] flex justify-center px-4 pb-4 sm:pb-6"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-gold/30 bg-card p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex-1">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold">
              Cookie Notice
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              We use cookies to improve your experience and analyze traffic. By clicking
              "Accept", you consent to our use of cookies.{' '}
              <a
                href="/cookie-policy/"
                className="text-navy underline decoration-gold/50 underline-offset-2 hover:text-gold"
              >
                Learn more
              </a>
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={handleDecline}
              className="rounded-xl border border-ink/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink/70 transition-colors hover:border-ink/40 hover:text-ink"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="rounded-xl bg-gold px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-parchment transition-all hover:brightness-110 btn-press"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
