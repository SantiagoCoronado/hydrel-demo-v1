import { Palette } from '@/components/Palette';
import { SldCanvas } from '@/components/SldCanvas';
import { Inspector } from '@/components/Inspector';
import { Button } from '@/components/Button';
import { useBuilder } from '@/lib/builder-store';
import { SCENARIOS } from '@/lib/scenarios';
import { useTheme } from '@/lib/theme';

function ScenarioBar() {
  const { theme } = useTheme();
  const isInstrument = theme === 'instrument';
  const { state, dispatch } = useBuilder();

  return (
    <div
      className="flex items-center gap-3 px-4 border-b"
      style={{
        height: 48,
        background: 'var(--panel)',
        borderColor: 'var(--line)',
      }}
    >
      <div
        className="font-mono uppercase text-[var(--fg-3)]"
        style={{ fontSize: 10, letterSpacing: '0.12em' }}
      >
        {isInstrument ? 'SCENARIO' : 'Scenario'}
      </div>
      <div
        className="flex gap-0"
        style={{
          background: 'var(--sub)',
          borderRadius: isInstrument ? 2 : 6,
          padding: 2,
          border: '1px solid var(--line)',
        }}
      >
        {SCENARIOS.map((s) => {
          const active = s.key === state.scenarioKey;
          return (
            <button
              key={s.key}
              onClick={() => dispatch({ type: 'LOAD_SCENARIO', key: s.key })}
              className="font-mono uppercase select-none cursor-pointer"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                padding: '5px 12px',
                borderRadius: isInstrument ? 2 : 4,
                background: active ? 'var(--panel)' : 'transparent',
                border: active ? '1px solid var(--line)' : '1px solid transparent',
                color: active ? 'var(--fg)' : 'var(--fg-2)',
                fontWeight: active ? 600 : 500,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <div
        className="flex items-center gap-2 font-mono text-[var(--fg-3)]"
        style={{ fontSize: 10, letterSpacing: '0.08em' }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: state.simulating ? 'var(--accent)' : 'var(--ok)',
            boxShadow: state.simulating ? '0 0 6px var(--accent)' : 'none',
          }}
        />
        {state.simulating ? 'COMPUTING' : isInstrument ? 'SYNCED' : 'Synced · live'}
      </div>

      <Button
        variant="secondary"
        onClick={() => dispatch({ type: 'SET_SIMULATING', on: true })}
      >
        {isInstrument ? 'SIMULATE' : 'Simulate'}
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          dispatch({ type: 'SET_SIMULATING', on: true });
        }}
      >
        {isInstrument ? 'DISPATCH ↑' : 'Dispatch ↑'}
      </Button>
    </div>
  );
}

export function PlantBuilder() {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <ScenarioBar />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Palette />
        <SldCanvas />
        <Inspector />
      </div>
    </div>
  );
}
