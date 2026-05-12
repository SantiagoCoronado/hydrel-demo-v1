import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/cn';

type Kind = 'ok' | 'warn' | 'err' | 'info' | 'idle';

const KIND_VAR: Record<Kind, string> = {
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  err: 'var(--err)',
  info: 'var(--accent)',
  idle: 'var(--fg-3)',
};

export function Pill({
  kind = 'ok',
  children,
  className,
  noDot = false,
}: {
  kind?: Kind;
  children: React.ReactNode;
  className?: string;
  noDot?: boolean;
}) {
  const { theme, mode } = useTheme();
  const color = KIND_VAR[kind];

  if (theme === 'instrument') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-[2px] text-[10px] font-mono uppercase tracking-[0.08em] border',
          className,
        )}
        style={{ color, borderColor: color }}
      >
        {!noDot && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full font-mono text-[10px] uppercase tracking-[0.08em]',
        className,
      )}
      style={{
        color,
        background: `color-mix(in oklch, ${color} 14%, transparent)`,
      }}
    >
      {!noDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full live-dot"
          style={{
            background: color,
            boxShadow: mode === 'dark' ? `0 0 6px ${color}` : 'none',
          }}
        />
      )}
      {children}
    </span>
  );
}
