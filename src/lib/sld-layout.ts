import type { Asset, AssetKind } from '@/data/assets';

export const BUS_X = 480;
export const BUS_TOP = 112;
export const BUS_BOTTOM = 466;
export const NODE_W = 56;
export const SOURCE_X = 192;
export const LOAD_X = 768;
export const SLOT_Y = [138, 222, 308, 394];
export const GRID_STEP = 20;

export function screenToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const out = pt.matrixTransform(ctm.inverse());
  return { x: out.x, y: out.y };
}

export function snapToGrid(p: { x: number; y: number }, step = GRID_STEP) {
  return {
    x: Math.round(p.x / step) * step,
    y: Math.round(p.y / step) * step,
  };
}

export function deriveSide(x: number): 'source' | 'load' {
  return x < BUS_X ? 'source' : 'load';
}

// Lower-edge clamp only. Upper bound is open — canvas auto-grows to fit.
export function clampToCanvas(
  p: { x: number; y: number },
  w = Infinity,
  h = Infinity,
  margin = 40,
) {
  return {
    x: Math.max(margin, Math.min(w - margin, p.x)),
    y: Math.max(20, Math.min(h - margin, p.y)),
  };
}

// Utility-specific clamp: must sit above the bus, below the canvas top.
// busTop is computed from utility.y + 100, so we keep utility >= 10 (top edge)
// and don't exceed (default busTop - 80) which is the floor before the bus collides.
export function clampUtility(p: { x: number; y: number }, busFloor = 32) {
  return {
    x: Math.max(40, p.x),
    y: Math.max(10, Math.min(busFloor, p.y)),
  };
}

const SIDE_BY_KIND: Record<AssetKind, 'source' | 'load' | 'utility'> = {
  PV: 'source',
  WT: 'source',
  BAT: 'source',
  DG: 'source',
  CHP: 'source',
  TES: 'source',
  H2: 'source',
  G: 'utility',
  L: 'load',
  EV: 'load',
  HVAC: 'load',
  X: 'load',
  BRK: 'load',
  BUS: 'load',
  FC: 'source',
  H2T: 'source',
  ELEC: 'load',
  METH: 'load',
  CO2C: 'load',
  HP: 'load',
};

export function defaultSideForKind(kind: AssetKind): 'source' | 'load' | 'utility' {
  return SIDE_BY_KIND[kind] ?? 'source';
}

export function nextNodeId(existingIds: string[], code: AssetKind): { id: string; name: string } {
  const prefix = NAME_PREFIX[code];
  let n = 1;
  // count siblings
  while (existingIds.includes(`${prefix}-${pad(n, code)}`)) n += 1;
  const id = `${prefix}-${pad(n, code)}`;
  return { id, name: id };
}

const NAME_PREFIX: Record<AssetKind, string> = {
  PV: 'PV',
  WT: 'WIND',
  BAT: 'BESS',
  DG: 'DG',
  CHP: 'CHP',
  TES: 'TES',
  H2: 'H2',
  G: 'UTIL',
  L: 'LOAD',
  EV: 'EV',
  HVAC: 'HVAC',
  X: 'XFMR',
  BRK: 'BRK',
  BUS: 'BUS',
  FC: 'FC',
  ELEC: 'ELEC',
  METH: 'METH',
  H2T: 'H2T',
  CO2C: 'CO2C',
  HP: 'HP',
};

function pad(n: number, code: AssetKind): string {
  // BESS / DG / WIND / EV / FC / ELEC use 2-digit zero-pad to match BESS-01 / DG-01
  if (
    code === 'BAT' ||
    code === 'DG' ||
    code === 'WT' ||
    code === 'EV' ||
    code === 'FC' ||
    code === 'ELEC' ||
    code === 'METH' ||
    code === 'H2T' ||
    code === 'CO2C' ||
    code === 'HP'
  ) {
    return String(n).padStart(2, '0');
  }
  return String(n);
}

interface AssetTemplate {
  description: string;
  flow: { value: number; label: string; signed?: boolean };
  pillLong: string;
  pillShort: string;
  pillKind: 'ok' | 'warn' | 'idle' | 'err';
  status: 'ok' | 'warn' | 'idle' | 'sel';
  tags: { key: string; value: string }[];
  readouts: { label: string; value: string; color?: 'ok' | 'warn' | 'err' | 'fg' | 'accent' }[];
  events: { ts: string; text: string; kind: 'ok' | 'op' | 'warn' | 'err' }[];
  sparkline?: number[];
  soc?: { value: number; target: number };
}

const TEMPLATES: Record<AssetKind, AssetTemplate> = {
  PV: {
    description: '2.10 MWp DC · array',
    flow: { value: 1.6, label: '1.60 MW · GEN' },
    pillLong: '● GENERATING',
    pillShort: '● GEN',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'MODEL', value: 'JKM-560M-72HL4' },
      { key: 'DC RATED', value: '2.10 MWp' },
      { key: 'AC RATED', value: '1.80 MW' },
      { key: 'INVERTER', value: 'SE-100K-US ×18' },
      { key: 'TILT', value: '20° south' },
    ],
    readouts: [
      { label: 'POWER', value: '1.60 MW', color: 'ok' },
      { label: 'IRRADIANCE', value: '820 W/m²' },
      { label: 'PR', value: '87.4%' },
    ],
    events: [{ ts: '02:14', text: 'Online · ramp +0.2 MW', kind: 'ok' }],
  },
  WT: {
    description: '1.50 MWp · GE 1.5XLE',
    flow: { value: 0.62, label: '0.62 MW · GEN' },
    pillLong: '● GENERATING',
    pillShort: '● GEN',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'MODEL', value: 'GE 1.5XLE' },
      { key: 'RATED', value: '1.50 MW' },
      { key: 'HUB', value: '80 m' },
      { key: 'WIND', value: '5.4 m/s' },
    ],
    readouts: [
      { label: 'POWER', value: '0.62 MW', color: 'ok' },
      { label: 'WIND', value: '5.4 m/s' },
      { label: 'YAW', value: '198°' },
    ],
    events: [{ ts: '02:14', text: 'Online · yaw nominal', kind: 'ok' }],
  },
  BAT: {
    description: 'Lithium-ion · 2.4 MW / 4.8 MWh · RTE 92%',
    flow: { value: 1.0, label: '+1.00 MW · DISCH', signed: true },
    pillLong: '● DISCHARGING',
    pillShort: '● DISCH',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'MODEL', value: 'LFP-2400 / 4800-V2' },
      { key: 'RATED', value: '2.40 MW / 4.80 MWh' },
      { key: 'RTE', value: '92.0 %' },
      { key: 'VBUS', value: '13.79 kV' },
      { key: 'TEMP', value: '26.8 °C' },
    ],
    readouts: [
      { label: 'POWER', value: '+1.00 MW', color: 'ok' },
      { label: 'SOC', value: '60.0%' },
      { label: 'VOLTAGE', value: '13.79 kV' },
      { label: 'TEMP', value: '26.8 °C' },
    ],
    soc: { value: 60, target: 70 },
    sparkline: [0.6, 0.8, 1.0, 1.1, 1.0, 0.8, 0.5, 0.2, 0, -0.2, -0.4, -0.5, -0.6, -0.5, -0.3, -0.1],
    events: [
      { ts: '02:14', text: 'Online · idle ramp', kind: 'ok' },
    ],
  },
  DG: {
    description: '1.0 MW STBY · Cummins QSK60-G7',
    flow: { value: 0, label: '0.00 MW · STBY' },
    pillLong: '● STANDBY',
    pillShort: '● SBY',
    pillKind: 'idle',
    status: 'idle',
    tags: [
      { key: 'MODEL', value: 'Cummins QSK60-G7' },
      { key: 'RATED', value: '1.00 MW' },
      { key: 'FUEL', value: 'Diesel · 9,200 L' },
      { key: 'STATUS', value: 'AUTO · STBY' },
    ],
    readouts: [
      { label: 'POWER', value: '0.00 MW' },
      { label: 'STATE', value: 'STANDBY' },
      { label: 'FUEL', value: '92%' },
    ],
    events: [{ ts: '02:14', text: 'Standby · auto-test pass', kind: 'ok' }],
  },
  CHP: {
    description: 'Cogen · 1.2 MWe · 1.6 MWth',
    flow: { value: 0.8, label: '0.80 MW · GEN' },
    pillLong: '● GENERATING',
    pillShort: '● GEN',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'Microturbine' },
      { key: 'RATED EL', value: '1.20 MW' },
      { key: 'RATED TH', value: '1.60 MWth' },
    ],
    readouts: [
      { label: 'POWER', value: '0.80 MW', color: 'ok' },
      { label: 'HEAT', value: '0.96 MWth' },
    ],
    events: [{ ts: '02:14', text: 'Online · stable load', kind: 'ok' }],
  },
  TES: {
    description: 'Thermal storage · 2.0 MWh',
    flow: { value: 0, label: '0.00 MW · IDLE' },
    pillLong: '● IDLE',
    pillShort: '● IDL',
    pillKind: 'idle',
    status: 'idle',
    tags: [
      { key: 'CAPACITY', value: '2.00 MWh' },
      { key: 'TEMP', value: '78 °C' },
    ],
    readouts: [
      { label: 'CHARGE', value: '0.00 MW' },
      { label: 'STORED', value: '1.20 MWh' },
    ],
    events: [],
  },
  H2: {
    description: 'Hydrogen · 250 kg storage',
    flow: { value: 0, label: '0.00 MW · IDLE' },
    pillLong: '● IDLE',
    pillShort: '● IDL',
    pillKind: 'idle',
    status: 'idle',
    tags: [
      { key: 'STORAGE', value: '250 kg' },
      { key: 'PRESSURE', value: '350 bar' },
    ],
    readouts: [
      { label: 'POWER', value: '0.00 MW' },
      { label: 'STORED', value: '180 kg' },
    ],
    events: [],
  },
  L: {
    description: 'Building load',
    flow: { value: 0.8, label: '0.80 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'General' },
      { key: 'PEAK', value: '1.20 MW' },
      { key: 'AVG', value: '0.80 MW' },
    ],
    readouts: [
      { label: 'POWER', value: '0.80 MW' },
      { label: 'AVG 24H', value: '0.7 MW' },
    ],
    events: [],
  },
  EV: {
    description: '12× DCFC · 3 active',
    flow: { value: 0.4, label: '0.40 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'DCFC ×12' },
      { key: 'ACTIVE', value: '3 stalls' },
      { key: 'PEAK', value: '1.80 MW' },
    ],
    readouts: [
      { label: 'POWER', value: '0.40 MW' },
      { label: 'STALLS', value: '3 / 12' },
    ],
    events: [],
  },
  HVAC: {
    description: 'HVAC plant',
    flow: { value: 0.4, label: '0.40 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'HVAC' },
      { key: 'CHILLERS', value: '1 of 2' },
    ],
    readouts: [
      { label: 'POWER', value: '0.40 MW' },
      { label: 'CHILLERS', value: '1 / 2' },
    ],
    events: [],
  },
  G: {
    description: '13.8 kV intertie',
    flow: { value: 0.4, label: '0.40 MW · IMPORT' },
    pillLong: '● IMPORT',
    pillShort: '● IMP',
    pillKind: 'warn',
    status: 'ok',
    tags: [
      { key: 'TIE', value: 'PCC-1' },
      { key: 'V', value: '13.79 kV' },
      { key: 'FREQ', value: '60.00 Hz' },
    ],
    readouts: [
      { label: 'IMPORT', value: '0.40 MW', color: 'warn' },
      { label: 'PF', value: '0.98' },
    ],
    events: [],
  },
  X: {
    description: 'Step-down transformer',
    flow: { value: 0, label: '— · XFMR' },
    pillLong: '● PASS',
    pillShort: '● PASS',
    pillKind: 'ok',
    status: 'ok',
    tags: [{ key: 'PRIMARY', value: '13.8 kV' }, { key: 'SECONDARY', value: '480 V' }],
    readouts: [{ label: 'PRI', value: '13.79 kV' }, { label: 'SEC', value: '478 V' }],
    events: [],
  },
  BRK: {
    description: 'Vacuum circuit breaker',
    flow: { value: 0, label: '— · BRK' },
    pillLong: '● CLOSED',
    pillShort: '● CL',
    pillKind: 'ok',
    status: 'ok',
    tags: [{ key: 'RATED', value: '630 A' }],
    readouts: [{ label: 'STATE', value: 'CLOSED' }],
    events: [],
  },
  BUS: {
    description: 'Busbar segment',
    flow: { value: 0, label: '— · BUS' },
    pillLong: '● ENERGIZED',
    pillShort: '● EN',
    pillKind: 'ok',
    status: 'ok',
    tags: [{ key: 'V', value: '13.79 kV' }],
    readouts: [{ label: 'V', value: '13.79 kV' }],
    events: [],
  },
  FC: {
    description: 'PEM fuel cell · 5.0 MW · η 92%',
    flow: { value: 4.8, label: '4.80 MW · GEN' },
    pillLong: '● GENERATING',
    pillShort: '● GEN',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'PEM stack' },
      { key: 'RATED', value: '5.00 MW' },
      { key: 'EFF', value: '92.0 %' },
      { key: 'STACK V', value: '720 VDC' },
      { key: 'H2 IN', value: '32 kg/h' },
      { key: 'STACK T', value: '78 °C' },
    ],
    readouts: [
      { label: 'POWER', value: '4.80 MW', color: 'ok' },
      { label: 'EFFICIENCY', value: '92.0%' },
      { label: 'H2 USE', value: '32 kg/h' },
      { label: 'TEMP', value: '78 °C' },
    ],
    sparkline: [4.0, 4.2, 4.4, 4.6, 4.8, 4.85, 4.8, 4.7, 4.6, 4.5, 4.6, 4.7, 4.8, 4.9, 4.85, 4.8],
    events: [
      { ts: '02:14', text: 'Stack temp nominal · ramp to 4.8 MW', kind: 'ok' },
      { ts: '01:42', text: 'H₂ supply switched to ELEC-01 buffer', kind: 'op' },
    ],
  },
  ELEC: {
    description: 'PEM electrolyzer · 2.0 MW · 32 kg/h H₂',
    flow: { value: 1.6, label: '1.60 MW' },
    pillLong: '● PRODUCING',
    pillShort: '● PROD',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'PEM electrolyzer' },
      { key: 'RATED', value: '2.00 MW' },
      { key: 'PROD', value: '32 kg/h H₂' },
      { key: 'PRESSURE', value: '30 bar' },
      { key: 'SEC', value: '52 kWh/kg' },
    ],
    readouts: [
      { label: 'POWER', value: '1.60 MW' },
      { label: 'H2 OUT', value: '32 kg/h' },
      { label: 'SEC', value: '52 kWh/kg' },
    ],
    sparkline: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.65, 1.6, 1.55, 1.5, 1.6, 1.65, 1.6, 1.55, 1.6, 1.65],
    events: [
      { ts: '02:14', text: 'Online · ramp to 1.6 MW', kind: 'ok' },
    ],
  },
  H2T: {
    description: 'H₂ storage · 250 kg · 350 bar',
    flow: { value: 0, label: '0.00 MW · BUFFER' },
    pillLong: '● BUFFER',
    pillShort: '● BUF',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'Type IV composite' },
      { key: 'CAPACITY', value: '250 kg' },
      { key: 'STORED', value: '180 kg' },
      { key: 'PRESSURE', value: '350 bar' },
    ],
    readouts: [
      { label: 'STORED', value: '180 kg' },
      { label: 'FILL', value: '72%' },
      { label: 'PRESS', value: '350 bar' },
    ],
    sparkline: [170, 172, 175, 178, 180, 182, 181, 180, 179, 180, 181, 182, 181, 180, 179, 180],
    events: [],
  },
  METH: {
    description: 'Methanation reactor · 0.5 MWth',
    flow: { value: 0.5, label: '0.50 MW' },
    pillLong: '● PRODUCING',
    pillShort: '● PROD',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'Sabatier reactor' },
      { key: 'RATED TH', value: '0.50 MWth' },
      { key: 'H2 IN', value: '8 kg/h' },
      { key: 'CO2 IN', value: '22 kg/h' },
      { key: 'CH4 OUT', value: '6 kg/h' },
    ],
    readouts: [
      { label: 'POWER', value: '0.50 MW' },
      { label: 'CH4 OUT', value: '6 kg/h' },
    ],
    events: [],
  },
  CO2C: {
    description: 'Direct-capture · 50 kg/h CO₂',
    flow: { value: 0.18, label: '0.18 MW' },
    pillLong: '● CAPTURING',
    pillShort: '● CAP',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'Amine DAC' },
      { key: 'CAPTURE', value: '50 kg/h CO₂' },
      { key: 'POWER', value: '0.18 MW' },
      { key: 'TODAY', value: '1.20 t' },
    ],
    readouts: [
      { label: 'POWER', value: '0.18 MW' },
      { label: 'CAPTURE', value: '50 kg/h' },
      { label: 'TOTAL', value: '1.20 t' },
    ],
    sparkline: [0.16, 0.17, 0.18, 0.18, 0.19, 0.18, 0.18, 0.17, 0.18, 0.19, 0.18, 0.17, 0.18, 0.18, 0.19, 0.18],
    events: [],
  },
  HP: {
    description: 'Heat pump · 0.4 MWe · 1.2 MWth',
    flow: { value: 0.4, label: '0.40 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    status: 'ok',
    tags: [
      { key: 'TYPE', value: 'Air-source HP' },
      { key: 'RATED EL', value: '0.40 MW' },
      { key: 'RATED TH', value: '1.20 MWth' },
      { key: 'COP', value: '3.0' },
    ],
    readouts: [
      { label: 'POWER', value: '0.40 MW' },
      { label: 'HEAT', value: '1.20 MWth' },
      { label: 'COP', value: '3.0' },
    ],
    events: [],
  },
};

const PALETTE_LABEL: Record<AssetKind, string> = {
  PV: 'Solar array',
  WT: 'Wind turbine',
  BAT: 'Battery',
  DG: 'Diesel gen',
  CHP: 'Cogen / CHP',
  TES: 'Thermal storage',
  H2: 'Hydrogen',
  L: 'Building load',
  EV: 'EV charging',
  HVAC: 'HVAC plant',
  G: 'Utility intertie',
  X: 'Transformer',
  BRK: 'Breaker',
  BUS: 'Busbar',
  FC: 'Fuel cell',
  ELEC: 'Electrolyzer',
  METH: 'Methanation',
  H2T: 'H₂ tank',
  CO2C: 'CO₂ capture',
  HP: 'Heat pump',
};

export function paletteLabel(code: AssetKind): string {
  return PALETTE_LABEL[code] ?? code;
}

export function makeAsset(
  id: string,
  name: string,
  code: AssetKind,
  position: { x: number; y: number },
): Asset {
  const tpl = TEMPLATES[code];
  const side = SIDE_BY_KIND[code];
  return {
    id,
    code,
    name,
    description: tpl.description,
    position,
    side,
    status: tpl.status,
    flow: { ...tpl.flow },
    pillLong: tpl.pillLong,
    pillShort: tpl.pillShort,
    pillKind: tpl.pillKind,
    tags: tpl.tags.map((t) => ({ ...t })),
    readouts: tpl.readouts.map((r) => ({ ...r })),
    soc: tpl.soc ? { ...tpl.soc } : undefined,
    sparkline: tpl.sparkline ? [...tpl.sparkline] : undefined,
    events: tpl.events.map((e) => ({ ...e })),
  };
}

export function formatMW(value: number, signed = false): string {
  const abs = Math.abs(value);
  const num = abs.toFixed(2);
  if (!signed) return `${num} MW`;
  if (value > 0.005) return `+${num} MW`;
  if (value < -0.005) return `−${num} MW`;
  return `${num} MW`;
}
