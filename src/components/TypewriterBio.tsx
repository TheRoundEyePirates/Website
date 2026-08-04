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

/** Escape a value for use inside an HTML attribute. */
function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Turn markdown links that stand alone on their own line into embedded
 * iframes, so the bio can host live displays (streams, scoring, etc.).
 * Links used inline inside a sentence stay normal clickable links.
 */
function embedifyLinks(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const match = line.match(/^\s*\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/);
      if (!match) return line;
      const label = escapeAttr(match[1]);
      const url = escapeAttr(match[2]);
      return `<figure class="markdown-embed"><figcaption>${label}</figcaption><div class="markdown-embed-frame"><iframe src="${url}" title="${label}" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share" allowfullscreen="true"></iframe></div></figure>`;
    })
    .join('\n');
}

export default function TypewriterBio({ text, cps = 28 }: TypewriterBioProps) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const html = useMemo(() => (done ? marked.parse(embedifyLinks(text)) : ''), [text, done]);

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
