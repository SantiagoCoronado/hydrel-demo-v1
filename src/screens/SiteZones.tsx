import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';
import { ZoneCard } from '@/components/ZoneCard';
import { ZONES, ZONE_COLOR_HEX, zoneById } from '@/data/zones';
import { useBuilder } from '@/lib/builder-store';
import { useTheme } from '@/lib/theme';

interface Props {
  onDrillDown: () => void;
}

function ZoneInspector({ onDrillDown }: { onDrillDown: () => void }) {
  const { theme } = useTheme();
  const isInstrument = theme === 'instrument';
  const { state, dispatch } = useBuilder();
  const zone = zoneById(state.selectedZoneId) ?? ZONES[0];
  const hex = ZONE_COLOR_HEX[zone.color];

  return (
    <aside
      className="border-l overflow-y-auto flex flex-col"
      style={{ width: 312, borderColor: 'var(--line)', background: 'var(--panel)' }}
    >
      <div
        className="p-4 border-b flex flex-col gap-2"
        style={{
          borderColor: 'var(--line)',
          borderLeft: isInstrument ? `3px solid ${hex}` : undefined,
        }}
      >
        <div
          className="font-mono uppercase text-[var(--fg-3)]"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          {isInstrument ? 'ZONE · DETAIL' : 'Zone detail'}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[var(--fg)]"
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
              letterSpacing: isInstrument ? '0' : '-0.01em',
            }}
          >
            {zone.name}
          </span>
          <Pill kind={zone.status === 'attention' ? 'warn' : zone.status === 'offline' ? 'err' : zone.status === 'standby' ? 'idle' : 'ok'}>
            {isInstrument ? zone.status.toUpperCase().slice(0, 4) : zone.status}
          </Pill>
        </div>
        <div className="text-[var(--fg-3)] text-[11px] font-mono" style={{ letterSpacing: '0.02em' }}>
          {zone.description}
        </div>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
        <div
          className="font-mono uppercase text-[var(--fg-3)] mb-1"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          {isInstrument ? 'HEADLINE METRIC' : 'Headline metric'}
        </div>
        <div
          className="tabular-nums text-[var(--fg)]"
          style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-mono)' }}
        >
          {zone.metric}
        </div>
        {zone.subMetric && (
          <div
            className="font-mono text-[var(--fg-3)] mt-1"
            style={{ fontSize: 11, letterSpacing: '0.04em' }}
          >
            {zone.subMetric}
          </div>
        )}
      </div>

      <div className="border-b" style={{ borderColor: 'var(--line)' }}>
        <div
          className="px-4 py-2 font-mono uppercase text-[var(--fg-3)]"
          style={{ fontSize: 10, letterSpacing: '0.12em', background: 'var(--sub)' }}
        >
          TAG VALUES
        </div>
        <div>
          {zone.tags.map((t, i) => (
            <div
              key={t.key}
              className="grid grid-cols-[110px_1fr] px-4 py-2 items-center"
              style={{
                background: isInstrument && i % 2 ? 'var(--sub)' : 'transparent',
                borderBottom: isInstrument ? '1px dotted var(--line)' : 'none',
              }}
            >
              <span
                className="font-mono uppercase text-[var(--fg-3)]"
                style={{ fontSize: 10, letterSpacing: '0.1em' }}
              >
                {t.key}
              </span>
              <span
                className="font-mono tabular-nums text-[var(--fg)]"
                style={{ fontSize: 11 }}
                data-num
              >
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
        <div
          className="font-mono uppercase text-[var(--fg-3)] mb-2"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          {isInstrument ? 'CONTAINED ASSETS' : 'Contained assets'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {zone.assetIds.map((id) => {
            const inStore = state.nodes.find((n) => n.id === id);
            const found = !!inStore;
            return (
              <button
                key={id}
                onClick={() => {
                  if (found) dispatch({ type: 'SELECT', id });
                }}
                className="font-mono uppercase cursor-pointer"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  padding: '4px 8px',
                  borderRadius: isInstrument ? 2 : 4,
                  background: found ? 'var(--sub)' : 'transparent',
                  border: '1px solid var(--line)',
                  color: found ? 'var(--fg)' : 'var(--fg-3)',
                }}
              >
                {id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      <div
        className="p-4 border-t flex gap-2"
        style={{ borderColor: 'var(--line)', background: 'var(--sub)' }}
      >
        <Button variant="primary" className="flex-1" onClick={onDrillDown}>
          {isInstrument ? 'DRILL → SLD ↗' : 'Drill into SLD ↗'}
        </Button>
      </div>
    </aside>
  );
}

export function SiteZones({ onDrillDown }: Props) {
  const { theme } = useTheme();
  const isInstrument = theme === 'instrument';
  const { state, dispatch } = useBuilder();

  const handleSelect = (zoneId: string) => {
    dispatch({ type: 'SELECT_ZONE', id: zoneId });
  };

  const handleDoubleClick = (zoneId: string) => {
    const zone = zoneById(zoneId);
    if (!zone) return;
    dispatch({ type: 'SELECT_ZONE', id: zoneId });
    const firstAsset = zone.assetIds.find((id) => state.nodes.some((n) => n.id === id));
    if (firstAsset) dispatch({ type: 'SELECT', id: firstAsset });
    onDrillDown();
  };

  return (
    <div className="h-full flex min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header band */}
        <div
          className="px-5 border-b flex items-center"
          style={{
            height: 56,
            background: 'var(--panel)',
            borderColor: 'var(--line)',
          }}
        >
          <div className="flex flex-col">
            <span
              className="text-[var(--fg)]"
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
                letterSpacing: isInstrument ? '0.04em' : '-0.01em',
              }}
            >
              {isInstrument ? 'SITE ZONES — FENIX MARINE TERMINAL' : 'Site Zones — Fenix Marine Terminal'}
            </span>
            <span
              className="font-mono uppercase text-[var(--fg-3)]"
              style={{ fontSize: 10, letterSpacing: '0.12em', marginTop: 2 }}
            >
              {isInstrument ? 'CLICK TO INSPECT · DBL-CLICK TO DRILL' : 'Click to inspect · double-click to drill'}
            </span>
          </div>
          <div className="flex-1" />
          <div
            className="font-mono uppercase text-[var(--fg-3)]"
            style={{ fontSize: 10, letterSpacing: '0.12em' }}
          >
            {ZONES.length} ZONES
          </div>
        </div>

        {/* Zone grid */}
        <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 12,
              padding: 20,
            }}
          >
            {ZONES.map((z) => (
              <ZoneCard
                key={z.id}
                zone={z}
                selected={state.selectedZoneId === z.id}
                onSelect={() => handleSelect(z.id)}
                onDoubleClick={() => handleDoubleClick(z.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <ZoneInspector onDrillDown={onDrillDown} />
    </div>
  );
}
