// Hydrel · Riverside / Fenix Marine — plant asset catalog and tag data.
// Used by PlantBuilder (palette + SLD) and LiveOperations (asset list).

export type AssetStatus = 'ok' | 'warn' | 'idle' | 'sel';
export type AssetKind = 'PV' | 'WT' | 'BAT' | 'DG' | 'L' | 'EV' | 'G' | 'CHP' | 'TES' | 'H2' | 'HVAC' | 'X' | 'BRK' | 'BUS';

export interface PaletteItem {
  code: AssetKind;
  label: string;
  highlight?: boolean;
}

export interface PaletteCategory {
  name: 'GENERATION' | 'STORAGE' | 'LOAD' | 'BALANCE';
  items: PaletteItem[];
}

export const PALETTE: PaletteCategory[] = [
  {
    name: 'GENERATION',
    items: [
      { code: 'PV', label: 'Solar array' },
      { code: 'WT', label: 'Wind turbine' },
      { code: 'DG', label: 'Diesel gen' },
      { code: 'CHP', label: 'Cogen / CHP' },
    ],
  },
  {
    name: 'STORAGE',
    items: [
      { code: 'BAT', label: 'Battery (BESS)', highlight: true },
      { code: 'TES', label: 'Thermal storage' },
      { code: 'H2', label: 'Hydrogen' },
    ],
  },
  {
    name: 'LOAD',
    items: [
      { code: 'L', label: 'Building load' },
      { code: 'EV', label: 'EV charging' },
      { code: 'HVAC', label: 'HVAC plant' },
    ],
  },
  {
    name: 'BALANCE',
    items: [
      { code: 'G', label: 'Utility intertie' },
      { code: 'X', label: 'Transformer' },
      { code: 'BRK', label: 'Breaker' },
      { code: 'BUS', label: 'Bus / busbar' },
    ],
  },
];

export interface AssetTag {
  key: string;
  value: string;
}

export interface AssetEvent {
  ts: string;            // HH:MM or HH:MM:SS
  text: string;
  kind: 'ok' | 'op' | 'warn' | 'err';
}

export interface Asset {
  id: string;
  code: AssetKind;
  name: string;
  description: string;
  position: { x: number; y: number };
  side: 'source' | 'load' | 'utility';
  status: AssetStatus;
  flow: { value: number; label: string; signed?: boolean };
  pillLong: string;
  pillShort: string;
  pillKind: 'ok' | 'warn' | 'idle' | 'err';
  tags: AssetTag[];
  readouts: { label: string; value: string; color?: 'ok' | 'warn' | 'err' | 'fg' | 'accent' }[];
  soc?: { value: number; target: number };
  events: AssetEvent[];
  sparkline?: number[];
}

// Hardcoded layout — matches HYDREL_DEMO_SPEC §"Canvas — Single-Line Diagram"
export const UTILITY: Asset = {
  id: 'UTIL',
  code: 'G',
  name: 'UTILITY',
  description: '13.8 kV intertie · SCE feeder PCC-1',
  position: { x: 480, y: 20 },
  side: 'utility',
  status: 'ok',
  flow: { value: 0.41, label: '0.41 MW · IMPORT' },
  pillLong: '● IMPORT',
  pillShort: '● IMP',
  pillKind: 'warn',
  tags: [
    { key: 'TIE', value: 'PCC-1' },
    { key: 'V', value: '13.79 kV' },
    { key: 'I', value: '17.2 A' },
    { key: 'FREQ', value: '60.00 Hz' },
  ],
  readouts: [
    { label: 'IMPORT', value: '0.41 MW', color: 'warn' },
    { label: 'RATE', value: '$0.18/kWh' },
    { label: 'PF', value: '0.98' },
  ],
  events: [
    { ts: '02:10', text: 'Frequency 60.00 nominal', kind: 'ok' },
    { ts: '01:18', text: 'Frequency excursion 60.04→59.98', kind: 'warn' },
  ],
};

export const SOURCES: Asset[] = [
  {
    id: 'PV-1',
    code: 'PV',
    name: 'PV-1',
    description: '4.20 MWp DC · 11.2k panels',
    position: { x: 192, y: 138 },
    side: 'source',
    status: 'ok',
    flow: { value: 3.21, label: '3.21 MW · GEN' },
    pillLong: '● GENERATING',
    pillShort: '● GEN',
    pillKind: 'ok',
    tags: [
      { key: 'MODEL', value: 'JKM-560M-72HL4' },
      { key: 'DC RATED', value: '4.20 MWp' },
      { key: 'AC RATED', value: '3.50 MW' },
      { key: 'INVERTER', value: 'SE-100K-US ×35' },
      { key: 'TILT', value: '20° south' },
      { key: 'POA', value: '842 W/m²' },
    ],
    readouts: [
      { label: 'POWER', value: '3.21 MW', color: 'ok' },
      { label: 'IRRADIANCE', value: '842 W/m²' },
      { label: 'PR', value: '88.2%' },
    ],
    events: [
      { ts: '02:00', text: 'Inverter 12 cleared dust alarm', kind: 'ok' },
      { ts: '01:14', text: 'Curtailment lifted, full output', kind: 'ok' },
    ],
  },
  {
    id: 'WIND-A',
    code: 'WT',
    name: 'WIND-A',
    description: '1.50 MWp · GE 1.5XLE',
    position: { x: 192, y: 222 },
    side: 'source',
    status: 'ok',
    flow: { value: 0.84, label: '0.84 MW · GEN' },
    pillLong: '● GENERATING',
    pillShort: '● GEN',
    pillKind: 'ok',
    tags: [
      { key: 'MODEL', value: 'GE 1.5XLE' },
      { key: 'RATED', value: '1.50 MW' },
      { key: 'HUB', value: '80 m' },
      { key: 'ROTOR', value: '82.5 m' },
      { key: 'WIND', value: '6.2 m/s' },
      { key: 'YAW', value: '212°' },
    ],
    readouts: [
      { label: 'POWER', value: '0.84 MW', color: 'ok' },
      { label: 'WIND', value: '6.2 m/s' },
      { label: 'YAW', value: '212°' },
    ],
    events: [
      { ts: '01:55', text: 'Yaw realign +18°', kind: 'op' },
      { ts: '00:42', text: 'Hub temp nominal 42°C', kind: 'ok' },
    ],
  },
  {
    id: 'BESS-01',
    code: 'BAT',
    name: 'BESS-01',
    description: 'Lithium-ion · 2.4 MW / 4.8 MWh · RTE 92%',
    position: { x: 192, y: 308 },
    side: 'source',
    status: 'sel',
    flow: { value: 1.84, label: '+1.84 MW · DISCH', signed: true },
    pillLong: '● DISCHARGING',
    pillShort: '● DISCH',
    pillKind: 'ok',
    tags: [
      { key: 'MODEL', value: 'LFP-2400 / 4800-V2' },
      { key: 'RATED', value: '2.40 MW / 4.80 MWh' },
      { key: 'RTE', value: '92.1 %' },
      { key: 'VBUS', value: '13.79 kV' },
      { key: 'IPHA', value: '154.2 A' },
      { key: 'TEMP', value: '27.4 °C' },
      { key: 'FAULT', value: '— · LAST 19D' },
    ],
    readouts: [
      { label: 'POWER', value: '+1.84 MW', color: 'ok' },
      { label: 'SOC', value: '64.2%' },
      { label: 'VOLTAGE', value: '13.79 kV' },
      { label: 'TEMP', value: '27.4 °C' },
    ],
    soc: { value: 64.2, target: 70 },
    sparkline: [1.4, 1.6, 1.7, 1.84, 1.9, 1.85, 1.7, 1.5, 1.2, 0.9, 0.6, 0.3, 0, -0.4, -0.6, -0.8],
    events: [
      { ts: '02:14', text: 'Discharge ramp +0.6 MW', kind: 'ok' },
      { ts: '02:08', text: 'Setpoint changed by op-jb', kind: 'op' },
      { ts: '01:42', text: 'Auto-charge ended SOC 70%', kind: 'ok' },
      { ts: '01:18', text: 'Frequency excursion 60.04→59.98', kind: 'warn' },
      { ts: '00:42', text: 'Health pass · 92% RTE', kind: 'ok' },
    ],
  },
  {
    id: 'DG-01',
    code: 'DG',
    name: 'DG-01',
    description: '1.0 MW STBY · Cummins QSK60-G7',
    position: { x: 192, y: 394 },
    side: 'source',
    status: 'idle',
    flow: { value: 0, label: '0.00 MW · STBY' },
    pillLong: '● STANDBY',
    pillShort: '● SBY',
    pillKind: 'idle',
    tags: [
      { key: 'MODEL', value: 'Cummins QSK60-G7' },
      { key: 'RATED', value: '1.00 MW' },
      { key: 'FUEL', value: 'Diesel · 9,200 L' },
      { key: 'HOURS', value: '142.6 h' },
      { key: 'LAST RUN', value: '11D 04H AGO' },
      { key: 'STATUS', value: 'AUTO · STBY' },
    ],
    readouts: [
      { label: 'POWER', value: '0.00 MW' },
      { label: 'STATE', value: 'STANDBY' },
      { label: 'FUEL', value: '92%' },
    ],
    events: [
      { ts: '00:00', text: 'Auto-test pass · 8.4 min', kind: 'ok' },
    ],
  },
];

export const LOADS: Asset[] = [
  {
    id: 'LOAD-MFG',
    code: 'L',
    name: 'LOAD-MFG',
    description: 'Process 24/7 · container handling',
    position: { x: 768, y: 138 },
    side: 'load',
    status: 'ok',
    flow: { value: 2.84, label: '2.84 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    tags: [
      { key: 'TYPE', value: 'Process 24/7' },
      { key: 'PEAK', value: '4.40 MW' },
      { key: 'AVG', value: '2.84 MW' },
      { key: 'CRITICAL', value: 'YES' },
    ],
    readouts: [
      { label: 'POWER', value: '2.84 MW' },
      { label: 'AVG 24H', value: '2.6 MW' },
    ],
    events: [
      { ts: '02:11', text: 'Shift change · ramp +0.4 MW', kind: 'op' },
    ],
  },
  {
    id: 'EV-FLEET',
    code: 'EV',
    name: 'EV-FLEET',
    description: '24× DCFC · 6 active',
    position: { x: 768, y: 222 },
    side: 'load',
    status: 'warn',
    flow: { value: 0.62, label: '0.62 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'warn',
    tags: [
      { key: 'TYPE', value: 'DCFC ×24' },
      { key: 'ACTIVE', value: '6 stalls' },
      { key: 'PEAK', value: '3.60 MW' },
      { key: 'CARRIER', value: 'CHAdeMO + CCS' },
    ],
    readouts: [
      { label: 'POWER', value: '0.62 MW', color: 'warn' },
      { label: 'STALLS', value: '6 / 24' },
    ],
    events: [
      { ts: '02:09', text: 'Demand spike 0.6 → 1.2 MW projected', kind: 'warn' },
    ],
  },
  {
    id: 'CRIT-UPS',
    code: 'L',
    name: 'CRIT-UPS',
    description: 'Critical UPS-backed loads',
    position: { x: 768, y: 308 },
    side: 'load',
    status: 'ok',
    flow: { value: 0.71, label: '0.71 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    tags: [
      { key: 'TYPE', value: 'UPS critical' },
      { key: 'AUTONOMY', value: '15 min' },
      { key: 'SWITCH', value: 'STATIC' },
    ],
    readouts: [
      { label: 'POWER', value: '0.71 MW' },
      { label: 'PF', value: '0.99' },
    ],
    events: [],
  },
  {
    id: 'HVAC-MAIN',
    code: 'L',
    name: 'HVAC-MAIN',
    description: 'Central plant chillers + AHU',
    position: { x: 768, y: 394 },
    side: 'load',
    status: 'ok',
    flow: { value: 0.55, label: '0.55 MW' },
    pillLong: '● ACTIVE',
    pillShort: '● ACT',
    pillKind: 'ok',
    tags: [
      { key: 'TYPE', value: 'HVAC' },
      { key: 'CHILLERS', value: '2 of 3' },
      { key: 'SETPT', value: '74°F' },
    ],
    readouts: [
      { label: 'POWER', value: '0.55 MW' },
      { label: 'CHILLERS', value: '2 / 3' },
    ],
    events: [],
  },
];

export const ALL_ASSETS: Asset[] = [UTILITY, ...SOURCES, ...LOADS];

// Live-Operations asset list (compact)
export interface OpsAssetRow {
  code: string;
  value: string;
  status: AssetStatus;
}

export const OPS_ASSETS: OpsAssetRow[] = [
  { code: 'PV-A', value: '3.21 MW', status: 'ok' },
  { code: 'PV-B', value: '1.94 MW', status: 'ok' },
  { code: 'WIND-A', value: '0.84 MW', status: 'ok' },
  { code: 'BESS-01', value: '+1.84 MW', status: 'sel' },
  { code: 'BESS-02', value: '−0.40 MW', status: 'ok' },
  { code: 'DG-1', value: 'standby', status: 'idle' },
  { code: 'LOAD-MFG', value: '4.10 MW', status: 'ok' },
  { code: 'LOAD-OFF', value: '0.18 MW', status: 'ok' },
  { code: 'EV-FLEET', value: '0.62 MW', status: 'warn' },
  { code: 'UTIL', value: '0.41 MW', status: 'ok' },
];
