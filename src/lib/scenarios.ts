import type { Asset } from '@/data/assets';
import { UTILITY, SOURCES, LOADS, H2_STACK } from '@/data/assets';
import { makeAsset } from './sld-layout';

export interface Wire {
  id: string;
  from: string;
  to: string;
  custom: true; // marker — auto wires (node↔bus) are derived, not stored
}

export interface BreakerState {
  // Per-node breaker state on the auto-routed node↔bus wire.
  // Not present = closed (default). True = open.
  [nodeId: string]: boolean;
}

export interface Scenario {
  key: 'baseline' | 'with-bess-02' | 'high-dr';
  label: string;
  nodes: Asset[];
  wires: Wire[];
  breakers: BreakerState;
}

const cloneNodes = (xs: Asset[]): Asset[] =>
  xs.map((a) => ({
    ...a,
    position: { ...a.position },
    flow: { ...a.flow },
    tags: a.tags.map((t) => ({ ...t })),
    readouts: a.readouts.map((r) => ({ ...r })),
    soc: a.soc ? { ...a.soc } : undefined,
    sparkline: a.sparkline ? [...a.sparkline] : undefined,
    events: a.events.map((e) => ({ ...e })),
  }));

export const BASELINE: Scenario = {
  key: 'baseline',
  label: 'Baseline',
  nodes: cloneNodes([UTILITY, ...SOURCES, ...LOADS, ...H2_STACK]),
  wires: [],
  breakers: {},
};

export const WITH_BESS_02: Scenario = (() => {
  const base = cloneNodes(BASELINE.nodes);
  // Move DG-01 down to slot 5; insert BESS-02 in DG's old slot.
  const dg = base.find((n) => n.id === 'DG-01');
  if (dg) dg.position = { x: 192, y: 460 };
  const bess02 = makeAsset('BESS-02', 'BESS-02', 'BAT', { x: 192, y: 394 });
  bess02.flow = { value: 0.6, label: '+0.60 MW · DISCH', signed: true };
  bess02.readouts = [
    { label: 'POWER', value: '+0.60 MW', color: 'ok' },
    { label: 'SOC', value: '58.0%' },
    { label: 'VOLTAGE', value: '13.79 kV' },
    { label: 'TEMP', value: '26.2 °C' },
  ];
  bess02.soc = { value: 58, target: 70 };
  return {
    key: 'with-bess-02',
    label: '+ BESS-02',
    nodes: [...base, bess02],
    wires: [],
    breakers: {},
  };
})();

export const HIGH_DR: Scenario = (() => {
  const base = cloneNodes(BASELINE.nodes).filter((n) => n.id !== 'EV-FLEET');
  // Replace EV-FLEET with a flexible DR load
  const dr = makeAsset('DR-FLEX', 'DR-FLEX', 'L', { x: 768, y: 222 });
  dr.description = 'Demand response · curtailable';
  dr.flow = { value: 0.18, label: '0.18 MW' };
  dr.tags = [
    { key: 'TYPE', value: 'DR · curtailable' },
    { key: 'PEAK', value: '1.40 MW' },
    { key: 'CURTAIL', value: '85%' },
    { key: 'PROGRAM', value: 'CAISO PDR' },
  ];
  dr.readouts = [
    { label: 'POWER', value: '0.18 MW' },
    { label: 'CURTAIL', value: '85%' },
  ];
  dr.events = [{ ts: '02:14', text: 'DR window active', kind: 'op' }];
  return {
    key: 'high-dr',
    label: 'High-DR',
    nodes: [...base, dr],
    wires: [],
    breakers: {},
  };
})();

export const SCENARIOS: Scenario[] = [BASELINE, WITH_BESS_02, HIGH_DR];

export function scenarioByKey(key: string): Scenario {
  return SCENARIOS.find((s) => s.key === key) ?? BASELINE;
}
