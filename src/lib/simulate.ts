import type { Asset } from '@/data/assets';
import { formatMW } from './sld-layout';
import type { BreakerState } from './scenarios';

// Naive sum-balance: Σ generation + Σ BESS_discharge − Σ loads = utility export.
// Utility absorbs whatever's left so the system always balances. We do NOT
// modify BESS dispatch here — that's the operator's setpoint and is set
// either by the SOC slider, manual edit, or scenario load.
//
// Open breakers force their node's contribution to zero.
export function simulate(nodes: Asset[], breakers: BreakerState): Asset[] {
  const next = nodes.map((n) => ({
    ...n,
    flow: { ...n.flow },
    readouts: n.readouts.map((r) => ({ ...r })),
  }));

  let sources = 0;
  let loads = 0;
  let bessSigned = 0;
  let utilityNode: Asset | undefined;

  for (const n of next) {
    const open = !!breakers[n.id];
    if (n.side === 'utility') {
      utilityNode = n;
      continue;
    }
    if (open) {
      // Breaker open → carries no power; force flow to zero in label
      n.flow.value = 0;
      n.flow.label = labelForOpen(n);
      continue;
    }
    if (n.code === 'BAT') {
      bessSigned += n.flow.value; // positive = discharge into bus
      continue;
    }
    if (n.side === 'source') {
      sources += Math.max(0, n.flow.value);
    } else if (n.side === 'load') {
      loads += Math.max(0, n.flow.value);
    }
  }

  // Net required from utility = loads - (sources + bess_discharge)
  // positive = import, negative = export
  let utilityImport = loads - sources - bessSigned;
  if (Math.abs(utilityImport) < 0.005) utilityImport = 0;

  if (utilityNode && !breakers[utilityNode.id]) {
    utilityNode.flow.value = +utilityImport.toFixed(2);
    if (utilityImport > 0.005) {
      utilityNode.flow.label = `${Math.abs(utilityImport).toFixed(2)} MW · IMPORT`;
      utilityNode.pillLong = '● IMPORT';
      utilityNode.pillShort = '● IMP';
      utilityNode.pillKind = 'warn';
    } else if (utilityImport < -0.005) {
      utilityNode.flow.label = `${Math.abs(utilityImport).toFixed(2)} MW · EXPORT`;
      utilityNode.pillLong = '● EXPORT';
      utilityNode.pillShort = '● EXP';
      utilityNode.pillKind = 'ok';
    } else {
      utilityNode.flow.label = '0.00 MW · BAL';
      utilityNode.pillLong = '● BALANCED';
      utilityNode.pillShort = '● BAL';
      utilityNode.pillKind = 'ok';
    }
    setReadout(
      utilityNode,
      utilityImport >= 0 ? 'IMPORT' : 'EXPORT',
      `${Math.abs(utilityImport).toFixed(2)} MW`,
      utilityImport > 0 ? 'warn' : 'ok',
    );
  } else if (utilityNode && breakers[utilityNode.id]) {
    // Utility breaker open: islanded — show as offline
    utilityNode.flow.value = 0;
    utilityNode.flow.label = '0.00 MW · ISO';
    utilityNode.pillLong = '● ISLANDED';
    utilityNode.pillShort = '● ISO';
    utilityNode.pillKind = 'err';
  }

  return next;
}

function setReadout(
  asset: Asset,
  label: string,
  value: string,
  color?: 'ok' | 'warn' | 'err' | 'fg' | 'accent',
) {
  let target = asset.readouts.find((r) => r.label.toUpperCase() === label.toUpperCase());
  if (!target && (label === 'IMPORT' || label === 'EXPORT')) {
    target = asset.readouts.find(
      (r) => r.label.toUpperCase() === 'IMPORT' || r.label.toUpperCase() === 'EXPORT',
    );
    if (target) target.label = label;
  }
  if (!target) return;
  target.value = value;
  if (color !== undefined) target.color = color;
}

function labelForOpen(asset: Asset): string {
  if (asset.code === 'BAT') return `${formatMW(0, true)} · OPEN`;
  if (asset.side === 'source') return '0.00 MW · OPEN';
  return '0.00 MW · OPEN';
}

export const recomputeUtility = simulate;
