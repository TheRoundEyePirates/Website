import { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';

marked.use({ gfm: true, breaks: false });

interface TypewriterBioProps {
  text: string;
  /** Characters typed per second. Defaults to a brisk pirate pace. */
  cps?: number;
}

/** Strip markdown syntax so the live-typed preview reads as plain text. */
function stripMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/^#{1,6}\s*/, ''))
    .join('\n')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^>\s?/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|~~|`|\*|_)/g, '');
}

export default function TypewriterBio({ text, cps = 28 }: TypewriterBioProps) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const html = useMemo(() => (done ? marked.parse(text) : ''), [text, done]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setShown(stripMarkdown(text));
      setDone(true);
      setRevealed(true);
      return;
    }

    const stepMs = Math.max(16, Math.round(1000 / cps));
    const tick = () => {
      indexRef.current = Math.min(indexRef.current + 2, text.length);
      setShown(stripMarkdown(text.slice(0, indexRef.current)));
      if (indexRef.current >= text.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setDone(true);
        requestAnimationFrame(() => setRevealed(true));
      }
    };

    timerRef.current = window.setInterval(tick, stepMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [text, cps]);

  return (
    <div>
      {!revealed && (
        <p
          aria-hidden="true"
          className="person-log person-typing whitespace-pre-wrap"
        >
          {shown}
          <span className="typewriter-cursor" />
        </p>
      )}

      {revealed && (
        <div
          className="person-log person-bio-in"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
