// Hydrel · Site Zones — Fenix Marine Terminal
// High-level zone cards rendered on the SiteZones screen.
// Each zone groups one or more SLD assets and surfaces a single headline metric.

export type ZoneStatus = 'operational' | 'standby' | 'attention' | 'offline';

export type ZoneColor =
  | 'cyan'
  | 'teal'
  | 'forest'
  | 'amber'
  | 'crimson'
  | 'plum'
  | 'indigo'
  | 'slate'
  | 'sand';

export interface Zone {
  id: string;
  name: string;
  color: ZoneColor;
  metric: string;        // headline value, e.g. "13.8 MW Import"
  subMetric?: string;    // small line under the headline, e.g. "13.8 kV · PCC-1"
  status: ZoneStatus;
  description: string;
  assetIds: string[];    // first id is used for drill-down selection
  tags: { key: string; value: string }[];
}

// Hex per color for both Helios (tinted fill) and Instrument (left-border accent).
export const ZONE_COLOR_HEX: Record<ZoneColor, string> = {
  cyan: '#42c8ff',
  teal: '#1aa39a',
  forest: '#2f8f4d',
  amber: '#e7a23b',
  crimson: '#e3573e',
  plum: '#8a4fbb',
  indigo: '#4d6dff',
  slate: '#5a6a82',
  sand: '#caa46a',
};

export const ZONES: Zone[] = [
  {
    id: 'Z-FUEL-CELL',
    name: 'Fuel Cell Power',
    color: 'cyan',
    metric: '4.80 MW',
    subMetric: 'Generating · η 92%',
    status: 'operational',
    description: 'PEM stack array · primary on-site generation for Berths 1A–1D.',
    assetIds: ['FC-01'],
    tags: [
      { key: 'STACK', value: '5.00 MW rated' },
      { key: 'OUTPUT', value: '4.80 MW' },
      { key: 'EFF', value: '92.0 %' },
      { key: 'H2 USE', value: '32 kg/h' },
    ],
  },
  {
    id: 'Z-GRID',
    name: 'Grid Interconnect',
    color: 'amber',
    metric: '0.41 MW Import',
    subMetric: '13.8 kV · PCC-1',
    status: 'operational',
    description: '13.8 kV intertie to SCE feeder · station-class breaker.',
    assetIds: ['UTIL'],
    tags: [
      { key: 'TIE', value: 'PCC-1' },
      { key: 'V', value: '13.79 kV' },
      { key: 'FREQ', value: '60.00 Hz' },
      { key: 'PF', value: '0.98' },
    ],
  },
  {
    id: 'Z-BATTERY',
    name: 'Battery Park',
    color: 'forest',
    metric: '+1.84 MW',
    subMetric: 'Discharging · SOC 64%',
    status: 'operational',
    description: 'BESS-01 lithium-ion · firming + peak-shave dispatch.',
    assetIds: ['BESS-01'],
    tags: [
      { key: 'CAPACITY', value: '4.80 MWh' },
      { key: 'POWER', value: '+1.84 MW' },
      { key: 'SOC', value: '64.2 %' },
      { key: 'RTE', value: '92.1 %' },
    ],
  },
  {
    id: 'Z-EV',
    name: 'EV Charging Depot',
    color: 'crimson',
    metric: '0.62 MW',
    subMetric: '6 of 24 stalls active',
    status: 'attention',
    description: 'Heavy-duty DCFC for fleet vehicles · CHAdeMO + CCS.',
    assetIds: ['EV-FLEET'],
    tags: [
      { key: 'STALLS', value: '6 / 24' },
      { key: 'PEAK', value: '3.60 MW' },
      { key: 'AVG', value: '0.62 MW' },
    ],
  },
  {
    id: 'Z-H2',
    name: 'H₂ Production',
    color: 'plum',
    metric: '32 kg/h',
    subMetric: 'ELEC-01 · 1.6 MW',
    status: 'operational',
    description: 'PEM electrolyzer + H₂ buffer storage feeding fuel cell.',
    assetIds: ['ELEC-01'],
    tags: [
      { key: 'PROD', value: '32 kg/h' },
      { key: 'POWER', value: '1.60 MW' },
      { key: 'STORED', value: '180 kg' },
      { key: 'PRESSURE', value: '350 bar' },
    ],
  },
  {
    id: 'Z-CARBON',
    name: 'Carbon Capture',
    color: 'teal',
    metric: '50 kg/h',
    subMetric: 'CO2C-01 · 1.20 t today',
    status: 'operational',
    description: 'Direct-air capture loop tied to local stack emissions.',
    assetIds: ['CO2C-01'],
    tags: [
      { key: 'CAPTURE', value: '50 kg/h CO₂' },
      { key: 'POWER', value: '0.18 MW' },
      { key: 'TODAY', value: '1.20 t' },
    ],
  },
  {
    id: 'Z-RENEWABLES',
    name: 'Renewables',
    color: 'indigo',
    metric: '4.05 MW',
    subMetric: 'PV-1 · WIND-A · co-gen',
    status: 'operational',
    description: 'Rooftop solar array + onshore turbine · clean firm capacity.',
    assetIds: ['PV-1', 'WIND-A'],
    tags: [
      { key: 'PV', value: '3.21 MW' },
      { key: 'WIND', value: '0.84 MW' },
      { key: 'PR', value: '88.2 %' },
    ],
  },
  {
    id: 'Z-STBY',
    name: 'Backup Diesel',
    color: 'slate',
    metric: 'Standby',
    subMetric: 'DG-01 · 11 d 04 h since',
    status: 'standby',
    description: 'Cummins QSK60 standby genset · auto-start on UTIL loss.',
    assetIds: ['DG-01'],
    tags: [
      { key: 'RATED', value: '1.00 MW' },
      { key: 'FUEL', value: '92 %' },
      { key: 'HOURS', value: '142.6 h' },
    ],
  },
  {
    id: 'Z-LOADS',
    name: 'Process Loads',
    color: 'sand',
    metric: '4.10 MW',
    subMetric: 'LOAD-MFG · CRIT-UPS · HVAC',
    status: 'operational',
    description: 'Container handling · UPS-backed critical · HVAC plant.',
    assetIds: ['LOAD-MFG', 'CRIT-UPS', 'HVAC-MAIN'],
    tags: [
      { key: 'MFG', value: '2.84 MW' },
      { key: 'CRIT', value: '0.71 MW' },
      { key: 'HVAC', value: '0.55 MW' },
    ],
  },
];

export function zoneById(id: string | null): Zone | null {
  if (!id) return null;
  return ZONES.find((z) => z.id === id) ?? null;
}
