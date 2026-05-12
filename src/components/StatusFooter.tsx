import { useTheme } from '@/lib/theme';
import { FOOTER_KPIS } from '@/data/timeseries';

const FIELDS: { key: string; value: string; tone?: 'ok' | 'warn' | 'err' | 'fg' }[] = [
  { key: 'FREQ', value: FOOTER_KPIS.freq, tone: 'fg' },
  { key: 'BUS', value: FOOTER_KPIS.bus, tone: 'fg' },
  { key: 'PF', value: FOOTER_KPIS.pf, tone: 'fg' },
  { key: 'NET', value: FOOTER_KPIS.net, tone: 'fg' },
  { key: 'BAT', value: FOOTER_KPIS.bat, tone: 'ok' },
  { key: 'IMP', value: FOOTER_KPIS.imp, tone: 'warn' },
  { key: 'CO₂', value: FOOTER_KPIS.co2, tone: 'ok' },
];

function toneColor(tone?: 'ok' | 'warn' | 'err' | 'fg') {
  if (tone === 'ok') return 'var(--ok)';
  if (tone === 'warn') return 'var(--warn)';
  if (tone === 'err') return 'var(--err)';
  return 'var(--fg)';
}

export function StatusFooter() {
  const { theme } = useTheme();

  if (theme === 'instrument') {
    return (
      <footer
        className="flex items-stretch border-t font-mono text-[10px] tracking-[0.08em]"
        style={{ height: 24, borderColor: 'var(--line)', background: 'var(--panel)' }}
      >
        {FIELDS.map((f) => (
          <div
            key={f.key}
            className="flex items-center gap-1.5 px-3 border-r"
            style={{ borderColor: 'var(--line)' }}
          >
            <span style={{ color: 'var(--fg-3)' }}>{f.key}</span>
            <span style={{ color: toneColor(f.tone) }}>{f.value}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 px-3 text-[var(--fg-3)]">
          <span>REV 04.B</span>
          <span>·</span>
          <span>IEC 61850</span>
          <span>·</span>
          <span>OPC-UA</span>
          <span>·</span>
          <span>UP 19D 14H</span>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="flex items-center gap-4 px-5 border-t text-[12px]"
      style={{ height: 28, borderColor: 'var(--line)', background: 'var(--panel)' }}
    >
      {FIELDS.map((f, i) => (
        <span key={f.key} className="flex items-center gap-2">
          <span className="text-[var(--fg-3)] uppercase tracking-[0.1em] font-mono text-[10px]">{f.key}</span>
          <span className="font-mono tabular-nums" style={{ color: toneColor(f.tone) }}>
            {f.value}
          </span>
          {i < FIELDS.length - 1 && <span className="text-[var(--fg-3)] ml-2">·</span>}
        </span>
      ))}
      <span className="ml-auto font-mono text-[11px] text-[var(--fg-3)]">
        v3.41 · twin commit 7a3f2b · IEC 61850
      </span>
    </footer>
  );
}
