import { useEffect, useState } from 'react';
import { Anchor } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="btn-press fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-card/90 text-gold shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy hover:shadow-[0_8px_24px_-6px_rgba(180,83,9,0.5)]"
    >
      <Anchor size={18} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
