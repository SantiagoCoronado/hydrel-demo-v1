import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';
import { SCENARIOS, ECON_YEARS, ECON_SERIES, ASSUMPTIONS, type Scenario } from '@/data/scenarios';

function fmtMoney(m: number) {
  return `$${m.toFixed(2)}M`;
}

function scenarioColor(s: Scenario) {
  return s.color === 'accent' ? 'var(--accent)' : 'var(--fg-2)';
}

function ScenarioBar({
  label,
  value,
  pct,
  color,
  formatted,
  withGlow,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
  formatted: string;
  withGlow: boolean;
}) {
  return (
    <div className="grid items-center gap-2.5" style={{ gridTemplateColumns: '90px 1fr 80px' }}>
      <span
        className="font-mono uppercase text-[var(--fg-3)]"
        style={{ fontSize: 10, letterSpacing: '0.1em' }}
      >
        {label}
      </span>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--sub)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(2, Math.min(100, pct))}%`,
            background: color,
            boxShadow: withGlow ? `0 0 6px ${color}` : 'none',
          }}
        />
      </div>
      <span
        className="font-mono tabular-nums text-right"
        style={{ fontSize: 11, color: 'var(--fg-2)' }}
        data-num
      >
        {formatted ?? value}
      </span>
    </div>
  );
}

export function ProjectEconomics() {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';
  const radius = isInstrument ? 2 : 12;

  const data = ECON_YEARS.map((year, i) => ({
    year,
    noCC: ECON_SERIES.noCC[i],
    bright: ECON_SERIES.bright[i],
    carbonQ: ECON_SERIES.carbonQ[i],
  }));

  const maxCapex = Math.max(...SCENARIOS.map((s) => s.capex));
  const maxValue = Math.max(...SCENARIOS.map((s) => s.fifteenYearValue));
  const maxCO2 = Math.max(...SCENARIOS.map((s) => s.co2Captured)) || 1;

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="px-7 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div
              className={isInstrument ? 'font-mono uppercase text-[var(--fg-3)]' : 'text-[var(--fg-3)]'}
              style={{
                fontSize: isInstrument ? 10 : 12,
                letterSpacing: isInstrument ? '0.12em' : 0,
                marginBottom: 6,
              }}
            >
              {isInstrument ? 'PROJECT · FENIX MARINE 5MW PLANT' : 'Project · Fenix Marine 5MW plant'}
            </div>
            <div
              className="text-[var(--fg)]"
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: isInstrument ? '0' : '-0.025em',
                fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
              }}
            >
              {isInstrument ? 'PROJECT ECONOMICS' : 'Project Economics · Fenix Marine'}
            </div>
            <div
              className="font-mono uppercase text-[var(--fg-3)] mt-2"
              style={{ fontSize: 10, letterSpacing: '0.12em' }}
            >
              THREE SCENARIOS · 15-YEAR PROJECTION · ROI · CAPEX · CO₂
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">{isInstrument ? 'EXPORT' : 'Export'}</Button>
            <Button variant="primary">{isInstrument ? 'PROMOTE TO PLAN →' : 'Promote to plan →'}</Button>
          </div>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-3 gap-3">
          {SCENARIOS.map((s) => {
            const col = scenarioColor(s);
            const isRec = s.recommended;
            return (
              <div
                key={s.id}
                className="p-5 border flex flex-col gap-4"
                style={{
                  background: 'var(--panel)',
                  borderColor: isRec ? 'color-mix(in oklch, var(--accent) 40%, var(--line))' : 'var(--line)',
                  borderRadius: radius,
                  boxShadow:
                    isRec && mode === 'dark' && !isInstrument
                      ? '0 0 0 1px color-mix(in oklch, var(--accent) 30%, transparent), 0 8px 36px color-mix(in oklch, var(--accent) 18%, transparent)'
                      : isRec && !isInstrument
                        ? '0 0 0 3px color-mix(in oklch, var(--accent) 15%, transparent)'
                        : 'none',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className="text-[var(--fg)]"
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: isInstrument ? '0' : '-0.015em',
                        fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
                      }}
                    >
                      {isInstrument ? s.name.toUpperCase() : s.name}
                    </div>
                    <div
                      className="font-mono text-[var(--fg-3)] mt-1"
                      style={{ fontSize: 11, letterSpacing: '0.02em' }}
                    >
                      {s.sub}
                    </div>
                  </div>
                  {isRec && <Pill kind="ok">{isInstrument ? 'RECOMMENDED' : 'Recommended'}</Pill>}
                </div>

                <div className="border-t pt-3" style={{ borderColor: 'var(--line)' }}>
                  <div
                    className="font-mono uppercase text-[var(--fg-3)]"
                    style={{ fontSize: 10, letterSpacing: '0.12em' }}
                  >
                    15-YEAR PROJECT VALUE
                  </div>
                  <div
                    className="tabular-nums mt-1.5"
                    style={{
                      fontSize: 28,
                      fontWeight: 600,
                      color: col,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '-0.01em',
                    }}
                    data-num
                  >
                    {fmtMoney(s.fifteenYearValue)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
                  {[
                    { l: 'CAPEX', v: fmtMoney(s.capex) },
                    { l: 'PAYBACK', v: s.payback },
                    { l: 'CO₂ CAPTURED', v: s.co2Captured ? `${s.co2Captured.toLocaleString('en-US')} mTon/yr` : '—' },
                    { l: 'CO₂ REVENUE 15Y', v: s.co2Revenue ? fmtMoney(s.co2Revenue) : '—' },
                    { l: 'ENERGY SAVINGS 15Y', v: fmtMoney(s.energySavings) },
                    { l: '45Q CREDITS', v: '$85/mTon' },
                  ].map((m) => (
                    <div key={m.l}>
                      <div
                        className="font-mono uppercase text-[var(--fg-3)]"
                        style={{ fontSize: 9, letterSpacing: '0.1em' }}
                      >
                        {m.l}
                      </div>
                      <div
                        className="tabular-nums text-[var(--fg)] mt-1"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}
                        data-num
                      >
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--line)' }}>
                  <ScenarioBar
                    label="CAPEX"
                    value={s.capex}
                    pct={(s.capex / maxCapex) * 100}
                    color={col}
                    formatted={fmtMoney(s.capex)}
                    withGlow={isRec && mode === 'dark' && !isInstrument}
                  />
                  <ScenarioBar
                    label="15YR VALUE"
                    value={s.fifteenYearValue}
                    pct={(s.fifteenYearValue / maxValue) * 100}
                    color={col}
                    formatted={fmtMoney(s.fifteenYearValue)}
                    withGlow={isRec && mode === 'dark' && !isInstrument}
                  />
                  <ScenarioBar
                    label="CO₂ CAPT"
                    value={s.co2Captured}
                    pct={(s.co2Captured / maxCO2) * 100}
                    color={col}
                    formatted={s.co2Captured ? `${(s.co2Captured / 1000).toFixed(1)}k mT/yr` : '—'}
                    withGlow={isRec && mode === 'dark' && !isInstrument}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cumulative-return chart */}
        <div
          className="p-5 border flex flex-col gap-3"
          style={{ background: 'var(--panel)', borderColor: 'var(--line)', borderRadius: radius }}
        >
          <div className="flex items-baseline justify-between">
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: isInstrument ? '0' : '-0.01em',
                fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
              }}
            >
              {isInstrument ? 'CUMULATIVE RETURN · 2026 → 2042' : 'Cumulative return · 2026 → 2042'}
            </div>
            <div
              className="font-mono uppercase text-[var(--fg-3)]"
              style={{ fontSize: 10, letterSpacing: '0.1em' }}
            >
              ROLLING TOTAL PROFIT · $ (M)
            </div>
          </div>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 18, left: -8, bottom: 4 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 4" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--fg-3)' }}
                  stroke="var(--line)"
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--fg-3)' }}
                  stroke="var(--line)"
                  tickFormatter={(v) => `$${v}M`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: isInstrument ? 2 : 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--fg)',
                  }}
                  formatter={(v) => {
                    const n = typeof v === 'number' ? v : 0;
                    return [`${n >= 0 ? '+' : ''}$${n.toFixed(2)}M`, ''];
                  }}
                  labelStyle={{ color: 'var(--fg-3)' }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}
                />
                <ReferenceLine y={0} stroke="var(--fg-3)" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="noCC"
                  name="No CC"
                  stroke="var(--fg-3)"
                  strokeWidth={1.3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="bright"
                  name="Bright Energy CC"
                  stroke="var(--accent)"
                  strokeWidth={2.2}
                  dot={false}
                  strokeDasharray={isInstrument ? '0' : '0'}
                />
                <Line
                  type="monotone"
                  dataKey="carbonQ"
                  name="Carbon Quest CC"
                  stroke="var(--fg-2)"
                  strokeWidth={1.3}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
            {ASSUMPTIONS.map((a) => (
              <span
                key={a}
                className="font-mono uppercase text-[var(--fg-3)]"
                style={{ fontSize: 10, letterSpacing: '0.1em' }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
