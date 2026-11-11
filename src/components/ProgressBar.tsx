export function ProgressBar({ value, max, small }: { value: number; max: number; small?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <span className="flex items-center gap-2">
      <span
        className={`block flex-1 overflow-hidden rounded-full bg-[var(--track)] ${small ? 'h-1' : 'h-2'}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </span>
      <span className={`tabular-nums text-[var(--muted)] ${small ? 'text-[10px]' : 'text-xs'}`}>
        {value}/{max}
      </span>
    </span>
  );
}
