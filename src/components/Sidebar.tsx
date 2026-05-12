import { useEffect, useState } from 'react';
import { Network, LayoutGrid, Activity, TrendingUp, Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { Screen } from '@/App';

const STORAGE_KEY = 'hydrel:sidebar:collapsed';

const ITEMS: { id: Screen; label: string; instrumentCode: string; short: string; icon: typeof Network }[] = [
  { id: 'plant', label: 'Plant Builder', instrumentCode: 'F1·BUILDER', short: 'F1', icon: Network },
  { id: 'zones', label: 'Site Zones', instrumentCode: 'F2·ZONES', short: 'F2', icon: LayoutGrid },
  { id: 'ops', label: 'Live Operations', instrumentCode: 'F3·OPS', short: 'F3', icon: Activity },
  { id: 'econ', label: 'Project Economics', instrumentCode: 'F4·ECON', short: 'F4', icon: TrendingUp },
  { id: 'cow', label: 'Cost of Waiting', instrumentCode: 'F5·DELAY', short: 'F5', icon: Clock },
];

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function Sidebar({ current, onSelect }: { current: Screen; onSelect: (s: Screen) => void }) {
  const { theme } = useTheme();
  const isInstrument = theme === 'instrument';
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  const expandedWidth = isInstrument ? 208 : 232;
  const width = collapsed ? 52 : expandedWidth;
  const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className="flex flex-col border-r"
      style={{
        width,
        borderColor: 'var(--line)',
        background: 'var(--panel)',
        transition: 'width 180ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Toggle row */}
      <div
        className="flex items-center border-b"
        style={{
          borderColor: 'var(--line)',
          height: 38,
          padding: collapsed ? 0 : '0 10px',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <span
            className="font-mono uppercase text-[var(--fg-3)]"
            style={{ fontSize: 10, letterSpacing: '0.12em' }}
          >
            {isInstrument ? 'NAV / FUNCTIONS' : 'Workspace'}
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="inline-flex items-center justify-center cursor-pointer"
          style={{
            width: 28,
            height: 28,
            color: 'var(--fg-2)',
            background: 'transparent',
            border: isInstrument ? '1px solid var(--line)' : 'none',
            borderRadius: isInstrument ? 2 : 4,
          }}
        >
          <Toggle size={15} strokeWidth={1.8} />
        </button>
      </div>

      <nav
        className="flex-1 flex flex-col"
        style={{ padding: collapsed ? '8px 0' : '10px 8px', gap: collapsed ? 4 : 2 }}
      >
        {ITEMS.map((item) => {
          const active = item.id === current;
          const Icon = item.icon;

          if (collapsed) {
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                title={item.label}
                aria-label={item.label}
                className="flex items-center justify-center cursor-pointer mx-auto"
                style={{
                  width: 36,
                  height: 36,
                  background: active ? 'var(--sub)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                  borderRadius: isInstrument ? 2 : 6,
                  color: active ? 'var(--fg)' : 'var(--fg-2)',
                }}
              >
                {isInstrument ? (
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, letterSpacing: '0.04em' }}
                  >
                    {item.short}
                  </span>
                ) : (
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    style={{ color: active ? 'var(--accent)' : 'var(--fg-3)' }}
                  />
                )}
              </button>
            );
          }

          if (isInstrument) {
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex items-center justify-between px-3 py-2 text-left font-mono uppercase tracking-[0.08em] text-[11px] cursor-pointer"
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
              className="flex items-center gap-2.5 px-3 py-2 text-left rounded-md text-[13px] transition-colors cursor-pointer"
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

      {!collapsed && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-3)]">
            {isInstrument ? 'REV 04.B · BUILD 7A3F2B' : 'v3.41 · twin 7a3f2b'}
          </div>
          <div className="mt-1 text-[11px] text-[var(--fg-3)]" style={{ fontFamily: 'var(--font-mono)' }}>
            Fenix Marine · POLA
          </div>
        </div>
      )}
    </aside>
  );
}
