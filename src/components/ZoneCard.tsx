import { useTheme } from '@/lib/theme';
import type { Zone } from '@/data/zones';
import { ZONE_COLOR_HEX } from '@/data/zones';

interface Props {
  zone: Zone;
  selected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
}

const STATUS_DOT: Record<Zone['status'], string> = {
  operational: 'var(--ok)',
  standby: 'var(--fg-3)',
  attention: 'var(--warn)',
  offline: 'var(--err)',
};

const STATUS_LABEL: Record<Zone['status'], string> = {
  operational: 'Operational',
  standby: 'Standby',
  attention: 'Attention',
  offline: 'Offline',
};

export function ZoneCard({ zone, selected, onSelect, onDoubleClick }: Props) {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';
  const isDark = mode === 'dark';
  const hex = ZONE_COLOR_HEX[zone.color];
  const statusColor = STATUS_DOT[zone.status];

  if (isInstrument) {
    return (
      <button
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
        className="text-left flex flex-col p-3 cursor-pointer transition-colors duration-150"
        style={{
          background: selected ? 'var(--sub)' : 'var(--panel)',
          border: '1px solid var(--line)',
          borderLeft: `3px solid ${hex}`,
          minHeight: 120,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="font-mono uppercase text-[var(--fg)]"
            style={{ fontSize: 11, letterSpacing: '0.06em', fontWeight: 600 }}
          >
            {zone.name}
          </span>
          <span
            className="inline-flex items-center gap-1 font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: '0.08em', color: statusColor, borderColor: statusColor }}
          >
            <span
              className="inline-block w-1.5 h-1.5"
              style={{ background: statusColor }}
            />
            {STATUS_LABEL[zone.status]}
          </span>
        </div>
        <div
          className="font-mono tabular-nums text-[var(--fg)] mt-auto"
          style={{ fontSize: 18, fontWeight: 600 }}
        >
          {zone.metric}
        </div>
        {zone.subMetric && (
          <div
            className="font-mono uppercase text-[var(--fg-3)] mt-1"
            style={{ fontSize: 9, letterSpacing: '0.08em' }}
          >
            {zone.subMetric}
          </div>
        )}
      </button>
    );
  }

  // Helios: tinted background, rounded, glow on selection
  const tint = selected
    ? `color-mix(in oklch, ${hex} ${isDark ? '32%' : '18%'}, var(--panel))`
    : `color-mix(in oklch, ${hex} ${isDark ? '20%' : '10%'}, var(--panel))`;

  return (
    <button
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className="text-left flex flex-col p-4 cursor-pointer transition-all duration-150"
      style={{
        background: tint,
        border: selected ? `1px solid ${hex}` : '1px solid var(--line)',
        borderRadius: 10,
        minHeight: 124,
        boxShadow: selected && isDark ? `0 0 24px color-mix(in oklch, ${hex} 30%, transparent)` : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[var(--fg)]" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {zone.name}
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-mono uppercase"
          style={{ fontSize: 9, letterSpacing: '0.08em', color: statusColor }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full live-dot"
            style={{
              background: statusColor,
              boxShadow: isDark ? `0 0 6px ${statusColor}` : 'none',
            }}
          />
          {STATUS_LABEL[zone.status]}
        </span>
      </div>
      <div
        className="text-[var(--fg-3)] text-[11px]"
        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}
      >
        {zone.description}
      </div>
      <div
        className="tabular-nums text-[var(--fg)] mt-auto"
        style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)' }}
      >
        {zone.metric}
      </div>
      {zone.subMetric && (
        <div
          className="font-mono text-[var(--fg-3)] mt-1"
          style={{ fontSize: 10, letterSpacing: '0.04em' }}
        >
          {zone.subMetric}
        </div>
      )}
    </button>
  );
}
