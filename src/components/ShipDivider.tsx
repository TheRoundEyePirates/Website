interface ShipDividerProps {
  label: string;
}

export default function ShipDivider({ label }: ShipDividerProps) {
  return (
    <div className="mb-8 flex w-full max-w-xs items-center gap-4" data-animate>
      <span className="ship-divider-line h-px flex-1" aria-hidden="true" />
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.35em] text-gold">
        {label}
      </span>
      <span className="ship-divider-line h-px flex-1" aria-hidden="true" />
    </div>
  );
}
