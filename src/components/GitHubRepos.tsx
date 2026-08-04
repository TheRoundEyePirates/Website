import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Code2, GitFork, Star } from 'lucide-react';
import ShipDivider from './ShipDivider';

const ORG = 'TheRoundEyePirates';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
}

type Status = 'loading' | 'ready' | 'empty' | 'error';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function GitHubRepos() {
  const [status, setStatus] = useState<Status>('loading');
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/orgs/${ORG}/repos?sort=updated&per_page=100`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        return res.json();
      })
      .then((data: Repo[]) => {
        setRepos(data.filter((repo) => !repo.fork));
        setStatus(data.length === 0 ? 'empty' : 'ready');
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });
    return () => controller.abort();
  }, []);

  return (
    <section id="code" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="Ship's Code" />

      <div
        data-animate="slide-up"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Our Code</h2>
        <a
          href={`https://github.com/orgs/${ORG}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/70 transition-colors hover:text-gold"
        >
          github.com/orgs/{ORG}
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {status === 'loading' &&
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-ink/15 bg-card p-6 opacity-60"
              aria-hidden="true"
            >
              <div className="h-4 w-1/2 animate-pulse bg-ink/15" />
              <div className="mt-4 h-3 w-full animate-pulse bg-ink/10" />
              <div className="mt-2 h-3 w-2/3 animate-pulse bg-ink/10" />
            </div>
          ))}

        {status === 'empty' && (
          <p className="border border-ink/25 bg-card p-6 font-mono text-sm text-ink/70 md:col-span-2">
            No public repositories yet — the crew is still carving the first logs.
          </p>
        )}

        {status === 'error' && (
          <p className="border border-ink/25 bg-card p-6 font-mono text-sm text-ink/70 md:col-span-2">
            Could not reach the GitHub galley. Check your connection and try again.
          </p>
        )}

        {status === 'ready' &&
          repos.map((repo) => (
            <article
              key={repo.id}
              data-stagger
              className="group flex flex-col border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(28,25,23,0.35)]"
            >
              <header className="flex items-start justify-between gap-3">
                <h3 className="flex min-w-0 items-center gap-2 font-display text-lg text-ink">
                  <Code2 size={16} strokeWidth={1.5} className="shrink-0 text-gold" aria-hidden="true" />
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate transition-colors hover:text-gold"
                  >
                    {repo.name}
                  </a>
                </h3>
                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${repo.name} live site`}
                    className="shrink-0 text-ink/40 transition-colors hover:text-gold"
                  >
                    <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                )}
              </header>

              <p className="mt-3 flex-1 font-mono text-sm leading-relaxed text-ink/70">
                {repo.description ?? 'No description on board yet.'}
              </p>

              <footer className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink/10 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={12} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                  {repo.language ?? '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star size={12} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                  {repo.stargazers_count}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GitFork size={12} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                  {repo.forks_count}
                </span>
                <span className="ml-auto">{fmtDate(repo.updated_at)}</span>
              </footer>
            </article>
          ))}
      </div>
    </section>
  );
}
