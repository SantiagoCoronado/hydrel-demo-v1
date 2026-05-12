import { Sun, Moon } from 'lucide-react';
import { useTheme, useThemeControls } from '@/lib/theme';
import { Wordmark } from './Wordmark';
import { Pill } from './Pill';
import { Clock } from './Clock';

const HELIOS_TABS = ['Baseline', '+ BESS-02', 'High-DR'];
const FN_TABS = ['F1·SLD', 'F2·MAP', 'F3·SIM', 'F4·HIST', 'F5·ALARMS'];

function ThemeToggle() {
  const { theme, mode } = useTheme();
  const { toggleMode } = useThemeControls();
  const isInstrument = theme === 'instrument';
  const isDark = mode === 'dark';
  const Icon = isDark ? Sun : Moon;
  return (
    <button
      onClick={toggleMode}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center cursor-pointer"
      style={{
        width: 28,
        height: 28,
        background: 'transparent',
        color: 'var(--fg-2)',
        border: isInstrument ? '1px solid var(--line)' : 'none',
        borderRadius: isInstrument ? 2 : 6,
      }}
    >
      <Icon size={15} strokeWidth={1.8} />
    </button>
  );
}

export function Header() {
  const { theme } = useTheme();

  if (theme === 'instrument') {
    return (
      <header
        className="flex items-center px-5 border-b"
        style={{ height: 44, borderColor: 'var(--line)', background: 'var(--panel)' }}
      >
        <Wordmark size={13} />
        <div className="ml-5 flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-[var(--fg-2)]">
          <span className="text-[var(--fg-3)]">|</span>
          <span>SITE RIVERSIDE-01</span>
          <span className="text-[var(--fg-3)]">/</span>
          <span className="text-[var(--fg)]">DESIGNER</span>
        </div>
        <nav className="ml-6 flex items-center gap-0 font-mono text-[11px] tracking-[0.06em]">
          {FN_TABS.map((t, i) => (
            <span
              key={t}
              className="px-3 py-[14px]"
              style={{
                color: i === 0 ? 'var(--fg)' : 'var(--fg-2)',
                borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-[var(--fg-3)]">
          <ThemeToggle />
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--ok)' }}
          />
          <span style={{ color: 'var(--fg)' }}>LIVE</span>
          <span className="text-[var(--fg-3)]">·</span>
          <Clock withMs />
        </div>
      </header>
    );
  }

  return (
    <header
      className="flex items-center px-6 border-b"
      style={{ height: 48, borderColor: 'var(--line)', background: 'var(--panel)' }}
    >
      <Wordmark size={16} />
      <div className="ml-5 flex items-baseline gap-2 text-[13px]">
        <span className="text-[var(--fg-2)]">Riverside Plant</span>
        <span className="text-[var(--fg-3)]">/</span>
        <span className="text-[var(--fg)]" style={{ letterSpacing: '-0.01em' }}>
          Facility designer
        </span>
      </div>
      <nav className="ml-7 flex items-center gap-5 text-[13px]">
        {HELIOS_TABS.map((t, i) => (
          <span
            key={t}
            className="py-[14px]"
            style={{
              color: i === 1 ? 'var(--fg)' : 'var(--fg-2)',
              borderBottom: i === 1 ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              letterSpacing: '-0.01em',
            }}
          >
            {t}
            {i === 1 && (
              <span className="ml-1 font-mono text-[10px] text-[var(--accent)]">(active)</span>
            )}
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <Pill kind="ok">
          SYNCED · <Clock />
        </Pill>
      </div>
    </header>
  );
}
