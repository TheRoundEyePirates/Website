interface ShipDividerProps {
  label: string;
  color?: string;
}

export default function ShipDivider({ label, color }: ShipDividerProps) {
  const cssVars = { '--divider-color': color ?? 'var(--color-gold)' } as React.CSSProperties;
  return (
    <div className="mb-8 flex w-full max-w-xs items-center gap-4" data-animate style={cssVars}>
      <span className="ship-divider-line h-px flex-1" aria-hidden="true" />
      <span
        className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.35em]"
        style={{ color: 'var(--divider-color)' }}
      >
        {label}
      </span>
      <span className="ship-divider-line h-px flex-1" aria-hidden="true" />
    </div>
  );
}
