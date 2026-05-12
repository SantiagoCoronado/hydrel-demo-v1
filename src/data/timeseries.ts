// Hydrel · Live Operations — 24h power flow series.
// Source: HYDREL_DEMO_SPEC §"Screen 2 — Live Operations · Power flow chart".

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const PV_GENERATION = [
  0, 0, 0, 0, 0.4, 1.2, 2.4, 3.1, 3.4, 3.6, 3.4, 3.2, 2.8, 2.2, 1.2, 0.4, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const LOAD_DEMAND = [
  3.2, 3.0, 2.9, 3.0, 3.2, 3.6, 4.1, 4.4, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0, 3.9, 3.7, 3.5, 3.4, 3.6, 3.7, 3.6, 3.4, 3.3,
  3.2,
];

export const FLOW_24H = HOURS.map((h) => ({
  hour: h,
  label: `${String(h).padStart(2, '0')}:00`,
  pv: PV_GENERATION[h],
  load: LOAD_DEMAND[h],
  net: +(LOAD_DEMAND[h] - PV_GENERATION[h]).toFixed(2),
}));

// Inspector dispatch sparkline (next 4h, 15-min steps)
export const DISPATCH_4H = [
  1.7, 1.84, 1.88, 1.9, 1.85, 1.7, 1.5, 1.2, 0.9, 0.6, 0.3, 0.0, -0.4, -0.6, -0.5, -0.3,
];

export const FOOTER_KPIS = {
  freq: '60.00 Hz',
  bus: '13.79 kV',
  pf: '0.98',
  net: '4.10 MW',
  bat: '+1.84 MW',
  imp: '0.41 MW',
  co2: '−312 kg/h',
};
