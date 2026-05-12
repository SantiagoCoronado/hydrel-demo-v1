import { Network, Activity, TrendingUp, Clock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { Screen } from '@/App';

const ITEMS: { id: Screen; label: string; instrumentCode: string; icon: typeof Network }[] = [
  { id: 'plant', label: 'Plant Builder', instrumentCode: 'F1·BUILDER', icon: Network },
  { id: 'ops', label: 'Live Operations', instrumentCode: 'F2·OPS', icon: Activity },
  { id: 'econ', label: 'Project Economics', instrumentCode: 'F3·ECON', icon: TrendingUp },
  { id: 'cow', label: 'Cost of Waiting', instrumentCode: 'F4·DELAY', icon: Clock },
];

export function Sidebar({ current, onSelect }: { current: Screen; onSelect: (s: Screen) => void }) {
  const { theme } = useTheme();
  const isInstrument = theme === 'instrument';

  return (
    <aside
      className="flex flex-col border-r"
      style={{
        width: isInstrument ? 208 : 232,
        borderColor: 'var(--line)',
        background: 'var(--panel)',
      }}
    >
      <div
        className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-3)] border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        {isInstrument ? 'NAV / FUNCTIONS' : 'Workspace'}
      </div>
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {ITEMS.map((item) => {
          const active = item.id === current;
          const Icon = item.icon;

          if (isInstrument) {
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex items-center justify-between px-3 py-2 text-left font-mono uppercase tracking-[0.08em] text-[11px]"
                style={{
                  background: active ? 'var(--sub)' : 'transparent',
                  color: active ? 'var(--fg)' : 'var(--fg-2)',
                  borderBottom: '1px solid var(--line)',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <span>{item.label}</span>
                <span className="text-[9px] text-[var(--fg-3)]">{item.instrumentCode}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex items-center gap-2.5 px-3 py-2 text-left rounded-md text-[13px] transition-colors"
              style={{
                background: active ? 'var(--sub)' : 'transparent',
                color: active ? 'var(--fg)' : 'var(--fg-2)',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                letterSpacing: '-0.01em',
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon size={15} strokeWidth={1.8} style={{ color: active ? 'var(--accent)' : 'var(--fg-3)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-3)]">
          {isInstrument ? 'REV 04.B · BUILD 7A3F2B' : 'v3.41 · twin 7a3f2b'}
        </div>
        <div className="mt-1 text-[11px] text-[var(--fg-3)]" style={{ fontFamily: 'var(--font-mono)' }}>
          Fenix Marine · POLA
        </div>
      </div>
    </aside>
  );
}
