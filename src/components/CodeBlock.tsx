import { useState } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';

interface CodeBlockProps {
  id: string;
  title: string;
  language: string;
  code: string;
  /** Pre-highlighted Shiki HTML for the snippet body. */
  html: string;
}

export default function CodeBlock({ id, title, language, code, html }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard unavailable — leave the button untouched. */
    }
  };

  return (
    <figure id={id} className="overflow-hidden border border-ink/25 bg-card shadow-[4px_4px_0_rgba(212,160,44,0.12)]">
      <figcaption className="flex flex-wrap items-center gap-2 bg-[#242933] px-4 py-3 text-parchment sm:px-5">
        <span className="mr-auto inline-flex min-w-0 items-center gap-2 font-mono text-xs text-[#d8dee9]">
          <FileCode2 size={14} className="shrink-0 text-gold" aria-hidden="true" />
          <span className="truncate">{title}</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[#8f9bb3] sm:inline">
            {id}.m
          </span>
        </span>
        <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-sm border border-ink/20 bg-sand px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold/60 hover:text-gold"
          aria-label={`Copy ${title} to clipboard`}
        >
          {copied ? (
            <Check size={12} className="text-gold" aria-hidden="true" />
          ) : (
            <Copy size={12} aria-hidden="true" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <div
        className="code-scroll overflow-x-auto bg-[#2e3440]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
