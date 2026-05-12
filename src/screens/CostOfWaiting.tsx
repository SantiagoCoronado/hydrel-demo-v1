import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/Button';

const START = 2_847_000;
const INTERVAL_MS = 216;
const FMT = new Intl.NumberFormat('en-US');

export function CostOfWaiting() {
  const { theme } = useTheme();
  const [n, setN] = useState(START);
  const ref = useRef(START);

  useEffect(() => {
    const id = window.setInterval(() => {
      ref.current += 1;
      setN(ref.current);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const isInstrument = theme === 'instrument';

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto flex flex-col gap-10 px-6 py-16" style={{ maxWidth: 760 }}>
        <div className="flex flex-col items-center text-center gap-5">
          <div
            className="font-mono uppercase text-[var(--fg-3)]"
            style={{ letterSpacing: '0.18em', fontSize: 11 }}
          >
            {isInstrument ? '— COST OF WAITING —' : 'COST OF WAITING'}
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-mono"
              style={{
                fontSize: 56,
                color: 'var(--warn)',
                fontWeight: 500,
              }}
            >
              $
            </span>
            <span
              className={`font-mono tabular-nums ${isInstrument ? '' : 'pulse-glow'}`}
              style={{
                fontSize: 80,
                color: 'var(--warn)',
                fontWeight: 600,
                letterSpacing: isInstrument ? '0' : '-0.02em',
                lineHeight: 1,
              }}
            >
              {FMT.format(n)}
            </span>
          </div>
          <div
            className="font-mono uppercase text-[var(--fg-3)]"
            style={{ letterSpacing: '0.18em', fontSize: 13 }}
          >
            LOST PER MONTH OF DELAY
          </div>
          <p
            className={`text-[var(--fg-2)] mt-4 ${isInstrument ? 'font-sans' : ''}`}
            style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 640 }}
          >
            Fenix Marine's grid energy cost is projected to grow from <strong className="text-[var(--fg)] font-mono">$357/MWh</strong> in 2026 to <strong className="text-[var(--fg)] font-mono">$742/MWh</strong> by 2042 — a 5% compounding annual increase. Every month the Hydrel plant isn't online, the terminal continues paying full retail rates and forgoes carbon-capture revenue. At current consumption, that's the meter above.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Time to first power', value: '12 months', sub: 'HyAxiom lead time · install in parallel' },
            { label: 'Time to payback', value: '8.2 years', sub: 'with Bright Energy carbon capture' },
            { label: '15-year value at risk', value: '$113.06M', sub: 'Bright scenario · vs. business as usual' },
          ].map((c) => (
            <div
              key={c.label}
              className="p-5 flex flex-col gap-2 border"
              style={{
                background: 'var(--panel)',
                borderColor: 'var(--line)',
                borderRadius: isInstrument ? 2 : 8,
              }}
            >
              <div
                className="font-mono uppercase text-[var(--fg-3)]"
                style={{ letterSpacing: '0.12em', fontSize: 10 }}
              >
                {c.label}
              </div>
              <div
                className="font-mono tabular-nums text-[var(--fg)]"
                style={{ fontSize: 22, fontWeight: 600, letterSpacing: isInstrument ? '0' : '-0.02em' }}
              >
                {c.value}
              </div>
              <div className="text-[var(--fg-3)] text-[11px] font-mono" style={{ letterSpacing: '0.02em' }}>
                {c.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="primary">Lock in Q3 2026 install →</Button>
        </div>

        <div
          className="font-mono uppercase text-[var(--fg-3)] text-center mt-8"
          style={{ letterSpacing: '0.1em', fontSize: 10 }}
        >
          {isInstrument
            ? 'FENIX MARINE · PORT OF LOS ANGELES · BERTHS 1A–1D · 5MW FUEL-CELL PLANT'
            : 'Fenix Marine · Port of Los Angeles · Berths 1A–1D · 5MW fuel-cell plant'}
        </div>
      </div>
    </div>
  );
}
