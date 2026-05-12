// Hydrel · Fenix Marine 5MW plant — investor economics.
// Source: HYDREL_DEMO_SPEC §"Screen 3 — Project Economics" + Hydrel's 4MW+Battery spreadsheet.

export interface Scenario {
  id: 'noCC' | 'bright' | 'carbonQ';
  name: string;
  sub: string;
  capex: number;            // M USD
  fifteenYearValue: number;
  payback: string;
  co2Captured: number;      // mTon/yr
  co2Revenue: number;       // M USD (15-yr)
  energySavings: number;    // M USD (15-yr)
  color: 'fg-2' | 'accent';
  recommended: boolean;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'noCC',
    name: 'No Carbon Capture',
    sub: '11 HyAxiom fuel cells · grid + NG only',
    capex: 26.79,
    fifteenYearValue: 101.01,
    payback: '10.3 years',
    co2Captured: 0,
    co2Revenue: 0,
    energySavings: 154.58,
    color: 'fg-2',
    recommended: false,
  },
  {
    id: 'bright',
    name: 'Bright Energy CC',
    sub: '13 HyAxiom + Bright LP-CooLab CC',
    capex: 51.12,
    fifteenYearValue: 113.06,
    payback: '8.2 years',
    co2Captured: 5665,
    co2Revenue: 57.12,
    energySavings: 141.71,
    color: 'accent',
    recommended: true,
  },
  {
    id: 'carbonQ',
    name: 'Carbon Quest CC',
    sub: '15 HyAxiom + Carbon Quest PSA',
    capex: 58.63,
    fifteenYearValue: 76.61,
    payback: '12.1 years',
    co2Captured: 5665,
    co2Revenue: 57.12,
    energySavings: 124.39,
    color: 'fg-2',
    recommended: false,
  },
];

export const ECON_YEARS = [
  2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042,
];

export const ECON_SERIES: Record<Scenario['id'], number[]> = {
  noCC: [
    -26.79, -25.85, -23.21, -19.4, -14.32, -7.91, 0.12, 9.45, 19.94, 22.18, 35.1, 49.05, 64.05, 80.16, 97.42, 115.89,
    135.66,
  ],
  bright: [
    -51.12, -49.44, -47.31, -44.64, -41.37, -37.38, -32.59, -26.85, -20.04, -11.98, -2.48, 7.45, 22.73, 40.56, 60.93,
    84.05, 113.06,
  ],
  carbonQ: [
    -58.63, -57.18, -55.42, -53.21, -50.42, -46.91, -42.55, -37.21, -30.74, -23.0, -13.83, -3.07, 9.51, 24.21, 41.36,
    61.33, 76.61,
  ],
};

export const ASSUMPTIONS = [
  'GRID RATE +5%/YR',
  'NG RATE +1%/YR',
  'CO₂ RESALE $250/mTON',
  '45Q CREDIT $85/mTON',
  'CO₂ HANDLING FEE 25%',
  '95% NG UTILIZATION',
];
