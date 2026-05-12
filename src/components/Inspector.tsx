import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import { Pill } from './Pill';
import { DISPATCH_4H } from '@/data/timeseries';
import type { Asset } from '@/data/assets';
import { useBuilder } from '@/lib/builder-store';

function kindPillColor(kind: 'ok' | 'warn' | 'err' | 'idle') {
  if (kind === 'idle') return 'idle' as const;
  return kind;
}

function EditableValue({
  value,
  editing,
  onCommit,
  className,
  style,
  type = 'text',
}: {
  value: string;
  editing: boolean;
  onCommit: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'text' | 'number';
}) {
  const [local, setLocal] = useState(value);
  // re-sync if external value changes (e.g. SOC slider, simulate, scenario load)
  if (!editing && local !== value) {
    // updating during render is ok since we use it to mirror prop
    setLocal(value);
  }
  if (!editing) {
    return (
      <span className={className} style={style} data-num>
        {value}
      </span>
    );
  }
  return (
    <input
      value={local}
      type={type}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onCommit(local);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.currentTarget as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
          setLocal(value);
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      className={className}
      style={{
        background: 'var(--sub)',
        color: 'var(--fg)',
        border: '1px solid var(--accent)',
        outline: 'none',
        padding: '0 4px',
        width: '100%',
        ...style,
      }}
      data-num
    />
  );
}

export function Inspector({ asset: assetProp }: { asset?: Asset }) {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';
  const { state, dispatch } = useBuilder();
  // Prefer store-driven selection; fall back to prop for backwards compat
  const fromStore = state.nodes.find((n) => n.id === state.selectedId) ?? null;
  const asset = fromStore ?? assetProp ?? state.nodes[0];
  if (!asset) return null;

  const editing = state.editingId === asset.id;
  const radius = isInstrument ? 2 : 8;
  const sparkData = (asset.sparkline ?? DISPATCH_4H).map((v, i) => ({ i, v }));

  const toggleEdit = () => {
    dispatch({ type: 'SET_EDITING', id: editing ? null : asset.id });
  };

  const dispatchSimulate = () => {
    if (editing) dispatch({ type: 'SET_EDITING', id: null });
    dispatch({ type: 'SET_SIMULATING', on: true });
  };

  return (
    <aside
      className="border-l overflow-y-auto flex flex-col"
      style={{ width: 312, borderColor: 'var(--line)', background: 'var(--panel)' }}
    >
      <div className="p-4 border-b flex flex-col gap-2" style={{ borderColor: 'var(--line)' }}>
        <div
          className="font-mono uppercase text-[var(--fg-3)]"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          {isInstrument ? 'INSPECTOR · TAG' : 'INSPECTOR'}
        </div>
        <div className="flex items-center justify-between gap-2">
          <EditableValue
            value={asset.name}
            editing={editing}
            onCommit={(v) => dispatch({ type: 'UPDATE_NAME', id: asset.id, name: v })}
            className="text-[var(--fg)]"
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
              letterSpacing: isInstrument ? '0' : '-0.01em',
              flex: 1,
            }}
          />
          <Pill kind={kindPillColor(asset.pillKind)}>
            {isInstrument ? asset.pillShort : asset.pillLong}
          </Pill>
        </div>
        <div className="text-[var(--fg-3)] text-[11px] font-mono" style={{ letterSpacing: '0.02em' }}>
          {asset.description}
        </div>
      </div>

      {/* Tag table */}
      <div className="border-b" style={{ borderColor: 'var(--line)' }}>
        <div
          className="px-4 py-2 font-mono uppercase text-[var(--fg-3)] flex items-center justify-between"
          style={{ fontSize: 10, letterSpacing: '0.12em', background: 'var(--sub)' }}
        >
          <span>TAG VALUES</span>
          {editing && (
            <span style={{ color: 'var(--accent)' }}>EDITING</span>
          )}
        </div>
        <div>
          {asset.tags.map((t, i) => (
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
              <EditableValue
                value={t.value}
                editing={editing}
                onCommit={(v) =>
                  dispatch({ type: 'UPDATE_TAG', id: asset.id, key: t.key, value: v })
                }
                className="font-mono tabular-nums text-[var(--fg)]"
                style={{ fontSize: 11 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Live readouts */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="font-mono uppercase text-[var(--fg-3)] mb-2"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          {isInstrument ? 'LIVE READOUTS' : 'Live readouts'}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {asset.readouts.map((r) => (
            <div key={r.label}>
              <div
                className="font-mono uppercase text-[var(--fg-3)]"
                style={{ fontSize: 9, letterSpacing: '0.1em' }}
              >
                {r.label}
              </div>
              <EditableValue
                value={r.value}
                editing={editing}
                onCommit={(v) =>
                  dispatch({ type: 'UPDATE_READOUT', id: asset.id, label: r.label, value: v })
                }
                className="tabular-nums mt-0.5 block"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color:
                    r.color === 'ok'
                      ? 'var(--ok)'
                      : r.color === 'warn'
                        ? 'var(--warn)'
                        : r.color === 'err'
                          ? 'var(--err)'
                          : r.color === 'accent'
                            ? 'var(--accent)'
                            : 'var(--fg)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SOC bar (only if asset has SOC) */}
      {asset.soc && (
        <div className="px-4 pt-3 pb-3">
          <div
            className="font-mono uppercase text-[var(--fg-3)] mb-2 flex items-center justify-between"
            style={{ fontSize: 10, letterSpacing: '0.12em' }}
          >
            <span>SOC</span>
            <span className="text-[var(--fg)] tabular-nums">
              {asset.soc.value.toFixed(1)}% · TARGET {asset.soc.target}%
            </span>
          </div>
          {/* Slider */}
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={asset.soc.value}
            onChange={(e) =>
              dispatch({ type: 'SET_SOC', id: asset.id, value: parseFloat(e.target.value) })
            }
            className="hydrel-soc"
            style={{ width: '100%', accentColor: isInstrument ? 'var(--fg)' : 'var(--ok)' }}
          />
          {isInstrument ? (
            <div
              className="border relative mt-1"
              style={{ borderColor: 'var(--line)', height: 16, background: 'var(--sub)' }}
            >
              <div
                className="absolute inset-y-0 left-0"
                style={{ width: `${asset.soc.value}%`, background: 'var(--fg)' }}
              />
              {[20, 40, 60, 80].map((t) => (
                <div
                  key={t}
                  className="absolute top-0 bottom-0"
                  style={{ left: `${t}%`, width: 1, background: 'var(--fg-3)', opacity: 0.5 }}
                />
              ))}
              <div
                className="absolute top-[-2px] bottom-[-2px]"
                style={{ left: `${asset.soc.target}%`, width: 2, background: 'var(--accent)' }}
              />
              <div className="absolute left-0 right-0 -bottom-4 flex justify-between font-mono text-[9px] text-[var(--fg-3)]">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
            </div>
          ) : (
            <div
              className="relative h-1.5 rounded-full mt-1"
              style={{ background: 'var(--sub)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${asset.soc.value}%`,
                  background: 'var(--ok)',
                  boxShadow: mode === 'dark' ? '0 0 8px var(--ok)' : 'none',
                }}
              />
              <div
                className="absolute -top-1 -bottom-1 w-px"
                style={{ left: `${asset.soc.target}%`, background: 'var(--fg-2)' }}
              />
            </div>
          )}
          <div
            className="font-mono text-[var(--fg-3)] mt-2"
            style={{ fontSize: 10, letterSpacing: '0.08em' }}
          >
            {isInstrument
              ? `TARGET ${asset.soc.target}% · DRAG SLIDER TO SET`
              : `Target ${asset.soc.target}% — drag slider to set dispatch`}
          </div>
        </div>
      )}

      {/* Sparkline */}
      <div className="px-4 pt-2 pb-3">
        <div
          className="font-mono uppercase text-[var(--fg-3)] mb-2 flex items-center justify-between"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          <span>{isInstrument ? 'DISPATCH · NEXT 4H' : 'Dispatch · next 4h'}</span>
          <span>NOW</span>
        </div>
        <div
          className="border"
          style={{
            height: 64,
            borderColor: 'var(--line)',
            borderRadius: isInstrument ? 2 : radius,
            background: 'var(--sub)',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isInstrument ? 'var(--fg)' : 'var(--accent)'} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={isInstrument ? 'var(--fg)' : 'var(--accent)'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                dataKey="v"
                stroke={isInstrument ? 'var(--fg)' : 'var(--accent)'}
                strokeWidth={1.4}
                fill={isInstrument ? 'transparent' : 'url(#sparkFill)'}
                isAnimationActive={false}
              />
              <ReferenceLine x={4} stroke="var(--fg-3)" strokeDasharray="2 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div
          className="flex justify-between font-mono text-[9px] text-[var(--fg-3)] mt-1"
          style={{ letterSpacing: '0.08em' }}
        >
          <span>-2h</span>
          <span>NOW</span>
          <span>+2h</span>
        </div>
      </div>

      {/* Event log */}
      <div className="px-4 pt-2 pb-3">
        <div
          className="font-mono uppercase text-[var(--fg-3)] mb-2"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          {isInstrument ? 'EVENTS · LAST 5' : 'Event log'}
        </div>
        <div className="flex flex-col gap-1">
          {asset.events.length === 0 && (
            <div className="text-[var(--fg-3)] text-[11px]">
              {isInstrument ? '— NO RECENT EVENTS —' : 'No recent events'}
            </div>
          )}
          {asset.events.map((e, i) => {
            const c =
              e.kind === 'warn'
                ? 'var(--warn)'
                : e.kind === 'err'
                  ? 'var(--err)'
                  : e.kind === 'op'
                    ? 'var(--fg-2)'
                    : 'var(--ok)';
            if (isInstrument) {
              return (
                <div
                  key={i}
                  className="grid grid-cols-[60px_1fr_36px] py-1 items-center font-mono"
                  style={{ fontSize: 10, borderBottom: '1px dotted var(--line)' }}
                >
                  <span className="text-[var(--fg-3)]">{e.ts}</span>
                  <span className="text-[var(--fg-2)] uppercase">{e.text}</span>
                  <span
                    className="text-right uppercase tracking-[0.08em] border px-1 py-[1px] inline-block"
                    style={{ color: c, borderColor: c, fontSize: 9 }}
                  >
                    {e.kind === 'op' ? 'OP' : e.kind === 'warn' ? 'WRN' : e.kind === 'err' ? 'ERR' : 'OK'}
                  </span>
                </div>
              );
            }
            return (
              <div key={i} className="flex items-baseline gap-2 text-[12px]">
                <span className="font-mono text-[var(--fg-3)] tabular-nums" style={{ fontSize: 11 }}>
                  {e.ts}
                </span>
                <span style={{ color: c }}>{e.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      <div
        className="p-4 border-t flex gap-2"
        style={{ borderColor: 'var(--line)', background: 'var(--sub)' }}
      >
        <Button variant={editing ? 'danger' : 'ghost'} className="flex-1" onClick={toggleEdit}>
          {editing ? (isInstrument ? 'DONE' : 'Done') : isInstrument ? 'EDIT' : 'Edit asset'}
        </Button>
        <Button variant="primary" className="flex-1" onClick={dispatchSimulate}>
          {isInstrument ? 'DISPATCH ↑' : 'Dispatch ↑'}
        </Button>
      </div>
    </aside>
  );
}
