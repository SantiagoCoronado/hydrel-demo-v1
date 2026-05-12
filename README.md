# Hydrel · Investor Demo

A frontend-only demo for Hydrel Energy — the software platform for designing, simulating, and operating complex on-site power systems. Configured for the **Fenix Marine Services** scenario at the Port of Los Angeles (Berths 1A–1D): a proposed 5 MW on-site fuel-cell plant with carbon capture.

The demo ships **two distinct visual identities**, selectable only via URL:

- `?theme=helios` — mission-control, glowing cyan, animated power-flow wires (default)
- `?theme=instrument` — Bloomberg-terminal density, monospace-everywhere, calibrated panel

Optional override: `?mode=dark|light`.

## Screens

| # | Screen | Route | Purpose |
|---|---|---|---|
| 1 | Plant Builder | default | Single-line diagram (SLD) canvas with palette + inspector. The wow moment. |
| 2 | Live Operations | sidebar | Real-time KPIs, asset list, dispatch panel. |
| 3 | Project Economics | sidebar | Three-scenario 15-year ROI comparison with cumulative-return chart. |
| 4 | Cost of Waiting | sidebar | Editorial single-page closer with a live-incrementing dollar meter. |

## Tech stack

Vite · React 18 · TypeScript · Tailwind v4 (CSS variables) · Recharts · Lucide · pnpm.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # production bundle
```

Try both themes side-by-side:
- http://localhost:5173/?theme=helios
- http://localhost:5173/?theme=instrument
- http://localhost:5173/?theme=helios&mode=light

## Project structure

```
src/
  main.tsx, App.tsx, index.css
  lib/theme.tsx, lib/cn.ts
  data/assets.ts        # palette + SLD asset tag tables
  data/scenarios.ts     # 3-scenario economics + 15yr series
  data/timeseries.ts    # 24h flow + footer KPIs
  components/
    Header, Sidebar, StatusFooter
    Pill, Button, Wordmark, Clock
    NodeSymbol, SldCanvas, Palette, Inspector
  screens/
    PlantBuilder, LiveOperations, ProjectEconomics, CostOfWaiting
```

All design tokens (color, font, radius, density) are CSS variables scoped under `[data-theme][data-mode]` on `<html>`. Tailwind utilities (`bg-panel`, `text-fg`, `border-line`) map to those vars — no inline styles for theming.

## Notes for the demo

- Plant Builder defaults to BESS-01 selected; clicking any asset (PV-1, WIND-A, DG-01, LOAD-MFG, etc.) updates the right inspector.
- Helios animates the marching-ants on power-flow wires and a soft pulse on the Cost-of-Waiting meter. Instrument never animates.
- All numbers use tabular-nums + `Intl.NumberFormat('en-US')`.
- Footer status (FREQ · BUS · PF · NET · BAT · IMP · CO₂) is visible on Plant Builder and Live Operations only.

— Built for the Fenix Marine investor pitch.
