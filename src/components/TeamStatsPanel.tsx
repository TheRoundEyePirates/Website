import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, MapPin, Swords, Trophy } from 'lucide-react';

const API = 'https://api.ftcscout.org/rest/v1';

interface TeamStatsPanelProps {
  team: number;
  season?: number;
}

interface TeamInfo {
  number: number;
  name: string;
  schoolName?: string;
  city?: string;
  state?: string;
  country?: string;
  rookieYear?: number;
  website?: string | null;
}

interface StatEntry {
  value: number;
  rank: number;
}

interface QuickStats {
  season: number;
  count: number;
  tot: StatEntry;
  auto: StatEntry;
  dc: StatEntry;
  eg: StatEntry;
}

interface EventRow {
  season: number;
  eventCode: string;
  stats?: {
    rank: number;
    wins: number;
    losses: number;
    ties: number;
    qualMatchesPlayed: number;
  };
}

interface AwardRow {
  season: number;
  eventCode: string;
  type: string;
  placement: number;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function StatBlock({ label, entry }: { label: string; entry?: StatEntry }) {
  return (
    <div className="flex flex-col gap-1 border border-ink/10 bg-card px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">{label}</dt>
      {entry ? (
        <dd className="font-mono text-sm text-ink">
          {entry.value.toFixed(1)}
          <span className="ml-2 text-[10px] text-ink/50">#{entry.rank}</span>
        </dd>
      ) : (
        <dd className="font-mono text-sm text-ink/40">—</dd>
      )}
    </div>
  );
}

export default function TeamStatsPanel({ team, season }: TeamStatsPanelProps) {
  const [info, setInfo] = useState<TeamInfo | null>(null);
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [matches, setMatches] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const [infoRes, statsRes, eventsRes, awardsRes, matchesRes] = await Promise.all([
        fetchJson<TeamInfo>(`${API}/teams/${team}`),
        season
          ? fetchJson<QuickStats>(`${API}/teams/${team}/quick-stats?season=${season}`)
          : Promise.resolve(null),
        season
          ? fetchJson<EventRow[]>(`${API}/teams/${team}/events/${season}`)
          : Promise.resolve(null),
        season
          ? fetchJson<AwardRow[]>(`${API}/teams/${team}/awards?season=${season}`)
          : Promise.resolve(null),
        season
          ? fetchJson<unknown[]>(`${API}/teams/${team}/matches?season=${season}`)
          : Promise.resolve(null),
      ]);

      if (cancelled) return;
      setInfo(infoRes);
      setStats(statsRes);
      setEvents(eventsRes ?? []);
      setAwards(awardsRes ?? []);
      setMatches(Array.isArray(matchesRes) ? matchesRes.length : null);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [team, season]);

  return (
    <div className="border border-ink/25 bg-card px-6 py-8 shadow-[4px_4px_0_rgba(28,25,23,0.08)] sm:px-10 sm:py-10">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-4">
        <h2 className="font-display text-2xl text-ink">FTC Team Data</h2>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink/50">
          powered by FTC Scout{season ? ` · ${season}` : ''}
        </p>
      </header>

      {loading ? (
        <p className="mt-8 flex items-center gap-2 font-mono text-sm text-ink/60">
          <Loader2 size={14} className="animate-spin text-gold" aria-hidden="true" />
          Sending a tiny robot messenger...
        </p>
      ) : !info ? (
        <p className="mt-8 font-mono text-sm text-ink/60">
          FTC Scout couldn't find team {team}. Check the <code className="text-ink">api</code> field
          in the bio.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl text-ink">
                #{info.number} <span className="text-gold">{info.name}</span>
              </h3>
              {info.schoolName && info.schoolName !== 'Unknown' && (
                <p className="mt-1 font-mono text-sm text-ink/70">{info.schoolName}</p>
              )}
              {(info.city || info.state || info.country) && (
                <p className="mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
                  <MapPin size={13} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                  {[info.city, info.state, info.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            {info.rookieYear && (
              <p className="border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/60">
                Rookie {info.rookieYear}
              </p>
            )}
          </div>

          {stats && (
            <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatBlock label="Total" entry={stats.tot} />
              <StatBlock label="Auto" entry={stats.auto} />
              <StatBlock label="Driver" entry={stats.dc} />
              <StatBlock label="Endgame" entry={stats.eg} />
            </dl>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold">
                <Trophy size={14} strokeWidth={1.5} aria-hidden="true" /> Awards
              </h4>
              {awards.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {awards.map((award, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 border border-ink/10 bg-sand px-4 py-3 font-mono text-sm text-ink"
                    >
                      <span className="min-w-0 truncate">{award.type}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-ink/50">
                        {award.placement === 1
                          ? '1st'
                          : `${award.placement}${award.placement === 2 ? 'nd' : award.placement === 3 ? 'rd' : 'th'}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 font-mono text-sm text-ink/50">No awards on record.</p>
              )}
            </div>

            <div>
              <h4 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold">
                <CalendarDays size={14} strokeWidth={1.5} aria-hidden="true" /> Events
              </h4>
              {events.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {events.map((event, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 border border-ink/10 bg-sand px-4 py-3 font-mono text-sm text-ink"
                    >
                      <span className="min-w-0 truncate">{event.eventCode}</span>
                      {event.stats ? (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-ink/50">
                          #{event.stats.rank} · {event.stats.wins}W-{event.stats.losses}L
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-ink/50">
                          attended
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 font-mono text-sm text-ink/50">No events on record.</p>
              )}
            </div>
          </div>

          <p className="mt-8 inline-flex items-center gap-2 border-t border-ink/15 pt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
            <Swords size={12} strokeWidth={1.5} aria-hidden="true" />
            {matches !== null ? `${matches} match${matches === 1 ? '' : 'es'} logged` : 'Match data unavailable'}
          </p>
        </>
      )}
    </div>
  );
}
