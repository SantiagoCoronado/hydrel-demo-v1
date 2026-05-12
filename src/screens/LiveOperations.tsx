import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useTheme } from '@/lib/theme';
import { FLOW_24H } from '@/data/timeseries';
import { OPS_ASSETS } from '@/data/assets';
import { Pill } from '@/components/Pill';
import { Button } from '@/components/Button';

const KPI = [
  { key: 'Net demand', value: '4.10', unit: 'MW', sub: '↓ 0.12 MW · 15-min', tone: 'fg' as const },
  { key: 'Battery SOC', value: '64.2', unit: '%', sub: '+1.84 MW · dispatch', tone: 'accent' as const },
  { key: 'Grid import', value: '0.41', unit: 'MW', sub: '$0.18/kWh · peak', tone: 'warn' as const },
  { key: 'CO₂ avoided', value: '312', unit: 'kg/h', sub: 'vs base', tone: 'ok' as const },
];

function toneColor(tone: 'fg' | 'accent' | 'warn' | 'ok') {
  if (tone === 'accent') return 'var(--accent)';
  if (tone === 'warn') return 'var(--warn)';
  if (tone === 'ok') return 'var(--ok)';
  return 'var(--fg)';
}

function statusColor(s: string) {
  if (s === 'warn') return 'var(--warn)';
  if (s === 'idle') return 'var(--fg-3)';
  if (s === 'sel') return 'var(--accent)';
  return 'var(--ok)';
}

export function LiveOperations() {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';
  const radius = isInstrument ? 2 : 8;

  return (
    <div className="h-full grid min-h-0" style={{ gridTemplateColumns: '240px 1fr 320px', background: 'var(--bg)' }}>
      {/* Asset list */}
      <div
        className="border-r overflow-y-auto"
        style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
      >
        <div
          className="px-3 py-3 font-mono uppercase text-[var(--fg-3)] border-b"
          style={{ borderColor: 'var(--line)', fontSize: 10, letterSpacing: '0.12em' }}
        >
          ASSETS · {OPS_ASSETS.length}
        </div>

        {isInstrument && (
          <div
            className="grid grid-cols-[40px_1fr_80px_36px] px-3 py-2 font-mono uppercase text-[var(--fg-3)] border-b"
            style={{ borderColor: 'var(--line)', fontSize: 9, letterSpacing: '0.1em' }}
          >
            <span>ST</span>
            <span>NAME</span>
            <span className="text-right">P (MW)</span>
            <span />
          </div>
        )}

        <div className={isInstrument ? '' : 'px-2 py-2'}>
          {OPS_ASSETS.map((a) => {
            const selected = a.status === 'sel';
            const color = statusColor(a.status);

            if (isInstrument) {
              return (
                <div
                  key={a.code}
                  className="grid grid-cols-[40px_1fr_80px_36px] px-3 py-2 border-b items-center"
                  style={{
                    borderColor: 'var(--line)',
                    background: selected ? 'var(--sub)' : 'transparent',
                    borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: 'var(--fg)', fontSize: 11 }}
                  >
                    {a.code}
                  </span>
                  <span
                    className="text-right font-mono tabular-nums text-[var(--fg-2)]"
                    style={{ fontSize: 11 }}
                  >
                    {a.value}
                  </span>
                  <span
                    className="text-right font-mono uppercase"
                    style={{ color, fontSize: 9, letterSpacing: '0.06em' }}
                  >
                    {a.status === 'sel' ? 'SEL' : a.status === 'warn' ? 'WRN' : a.status === 'idle' ? 'SBY' : 'OK'}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={a.code}
                className="flex items-center justify-between px-2.5 py-2 rounded-md"
                style={{
                  background: selected ? (mode === 'dark' ? 'color-mix(in oklch, var(--accent) 12%, transparent)' : 'var(--sub)') : 'transparent',
                  border: selected && mode === 'dark' ? '1px solid color-mix(in oklch, var(--accent) 30%, transparent)' : '1px solid transparent',
                  marginTop: 2,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                      background: color,
                      boxShadow: mode === 'dark' && a.status !== 'idle' ? `0 0 6px ${color}` : 'none',
                    }}
                  />
                  <span className="text-[var(--fg)] font-medium" style={{ fontSize: 13, letterSpacing: '-0.01em' }}>
                    {a.code}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-[var(--fg-2)]" style={{ fontSize: 12 }}>
                  {a.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: title + KPIs + chart */}
      <div className="flex flex-col min-h-0 overflow-hidden p-6 gap-4">
        <div>
          <div
            className="text-[var(--fg)]"
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: isInstrument ? '0' : '-0.02em',
              fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
            }}
          >
            {isInstrument ? 'RIVERSIDE PLANT' : 'Riverside Plant'}
          </div>
          <div className="mt-1 text-[var(--fg-3)] text-[13px]">
            {isInstrument
              ? 'OPERATIONS · SCENARIO PEAK-SHAVE-V3'
              : 'Operations · scenario peak-shave-v3'}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {KPI.map((k) => (
            <div
              key={k.key}
              className="p-3.5 border"
              style={{ background: 'var(--panel)', borderColor: 'var(--line)', borderRadius: radius }}
            >
              <div
                className={isInstrument ? 'font-mono uppercase' : ''}
                style={{
                  fontSize: isInstrument ? 10 : 12,
                  color: 'var(--fg-3)',
                  letterSpacing: isInstrument ? '0.12em' : 0,
                }}
              >
                {isInstrument ? k.key.toUpperCase() : k.key}
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: toneColor(k.tone),
                    fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
                    letterSpacing: isInstrument ? '0' : '-0.02em',
                  }}
                >
                  {k.value}
                </span>
                <span
                  className="font-mono text-[var(--fg-3)]"
                  style={{ fontSize: 12 }}
                >
                  {k.unit}
                </span>
              </div>
              <div
                className="font-mono text-[var(--fg-3)] mt-1.5"
                style={{ fontSize: 11 }}
              >
                {k.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex-1 min-h-0 flex flex-col border p-4"
          style={{ background: 'var(--panel)', borderColor: 'var(--line)', borderRadius: radius }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: isInstrument ? '0' : '-0.01em',
                fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
              }}
            >
              {isInstrument ? 'POWER FLOW · LAST 24 HOURS' : 'Power flow · last 24 hours'}
            </div>
            <div
              className="font-mono uppercase text-[var(--fg-3)]"
              style={{ fontSize: 11, letterSpacing: '0.06em' }}
            >
              PV · LOAD · BATTERY
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={FLOW_24H} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 4" vertical={false} />
                <XAxis
                  dataKey="hour"
                  ticks={[0, 6, 12, 18, 23]}
                  tickFormatter={(v) => `${String(v).padStart(2, '0')}:00`}
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--fg-3)' }}
                  stroke="var(--line)"
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickFormatter={(v) => `${v}`}
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--fg-3)' }}
                  stroke="var(--line)"
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: radius,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--fg)',
                  }}
                  labelStyle={{ color: 'var(--fg-3)' }}
                  labelFormatter={(v) => `${String(v).padStart(2, '0')}:00`}
                />
                <Area
                  type="monotone"
                  dataKey="pv"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  fill="url(#pvFill)"
                  name="PV"
                />
                <Line
                  type="monotone"
                  dataKey="load"
                  stroke="var(--fg-2)"
                  strokeWidth={1.4}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Load"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right: Dispatch panel */}
      <div
        className="border-l p-5 flex flex-col gap-3.5 overflow-y-auto"
        style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
      >
        <div>
          <div
            className={isInstrument ? 'font-mono uppercase' : 'text-[var(--fg-3)]'}
            style={{
              fontSize: isInstrument ? 10 : 12,
              color: 'var(--fg-3)',
              letterSpacing: isInstrument ? '0.12em' : 0,
            }}
          >
            {isInstrument ? 'DISPATCH' : 'Dispatch'}
          </div>
          <div
            className="text-[var(--fg)] mt-1"
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: isInstrument ? '0' : '-0.02em',
              fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
            }}
          >
            {isInstrument ? 'PEAK SHAVE · BESS-01' : 'Peak shave · BESS-01'}
          </div>
        </div>

        <div
          className="p-4 border"
          style={{
            background: 'var(--sub)',
            borderColor: 'var(--line)',
            borderRadius: radius,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={isInstrument ? 'font-mono uppercase' : ''}
              style={{
                fontSize: isInstrument ? 10 : 12,
                color: 'var(--fg-3)',
                letterSpacing: isInstrument ? '0.12em' : 0,
              }}
            >
              SOC
            </span>
            <span className="font-mono tabular-nums text-[var(--fg)]" style={{ fontSize: 12 }}>
              64.2% → 58.0%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
            <div
              className="h-full"
              style={{
                width: '64%',
                background: 'var(--accent)',
                boxShadow: mode === 'dark' && !isInstrument ? '0 0 8px var(--accent)' : 'none',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { l: 'POWER', v: '+1.84 MW', c: 'var(--fg)' },
              { l: 'DURATION', v: '1h 42m', c: 'var(--fg)' },
              { l: 'SAVINGS', v: '$1,284', c: 'var(--ok)' },
              { l: 'CO₂', v: '−312 kg', c: 'var(--ok)' },
            ].map((m) => (
              <div key={m.l}>
                <div
                  className="font-mono uppercase text-[var(--fg-3)]"
                  style={{ fontSize: 10, letterSpacing: '0.12em' }}
                >
                  {m.l}
                </div>
                <div
                  className="tabular-nums mt-1"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: m.c,
                    fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
                    letterSpacing: isInstrument ? '0' : '-0.01em',
                  }}
                >
                  {m.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="primary" full>
          {isInstrument ? 'DISPATCH NOW →' : 'Dispatch now →'}
        </Button>
        <Button variant="secondary" full>
          {isInstrument ? 'SCHEDULE' : 'Schedule'}
        </Button>

        <div className="flex-1" />

        <div className="border-t pt-3" style={{ borderColor: 'var(--line)' }}>
          <div
            className="font-mono uppercase text-[var(--fg-3)] mb-2"
            style={{ fontSize: 10, letterSpacing: '0.12em' }}
          >
            ALARMS · 1
          </div>
          <div className="flex items-center gap-2 text-[var(--fg-2)] text-[12px]">
            <Pill kind="warn">CAUTION</Pill>
            <span>EV-FLEET demand spike</span>
          </div>
        </div>
      </div>
    </div>
  );
}
