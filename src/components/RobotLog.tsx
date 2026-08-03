import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, Anchor, Cpu, Gauge, Wrench, Zap } from 'lucide-react';
import ShipDivider from './ShipDivider';

export interface LogEntryData {
  season: string;
  drive: string;
  motors: number;
  servos: number;
  controlSystem: string;
  status: string;
}

interface RobotLogProps extends LogEntryData {
  children: ReactNode;
}

interface SpecField {
  label: string;
  value: string;
  icon: LucideIcon;
}

export default function RobotLog({
  season,
  drive,
  motors,
  servos,
  controlSystem,
  status,
  children,
}: RobotLogProps) {
  const fields: SpecField[] = [
    { label: 'Season', value: season, icon: Anchor },
    { label: 'Drive Train', value: drive, icon: Gauge },
    { label: 'Motors', value: String(motors), icon: Zap },
    { label: 'Servos', value: String(servos), icon: Wrench },
    { label: 'Control System', value: controlSystem, icon: Cpu },
    { label: 'Status', value: status, icon: Activity },
  ];

  return (
    <section id="robot" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="The Robot" />

      <div
        data-animate="scale"
        className="border border-ink/25 bg-[#faf6ec] px-6 py-8 shadow-[4px_4px_0_rgba(28,25,23,0.08)] sm:px-10 sm:py-10"
      >
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-4">
          <h2 className="font-display text-2xl text-ink">Captain's Log</h2>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink/50">
            Entry No. 001 — Build Season
          </p>
        </header>

        <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center gap-3 bg-[#faf6ec] px-4 py-3"
            >
              <field.icon
                size={16}
                strokeWidth={1.5}
                className="shrink-0 text-gold"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                  {field.label}
                </dt>
                <dd className="truncate font-mono text-sm text-ink">{field.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="log-body">{children}</div>
      </div>
    </section>
  );
}
