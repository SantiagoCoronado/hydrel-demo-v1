import { useTheme } from '@/lib/theme';

interface Props {
  cx: number;
  cy: number;
  data: number[];
  mode: 'compact' | 'expanded';
  tick: number;
  color?: string;
  unit?: string;
}

const COMPACT_W = 84;
const COMPACT_H = 26;
const EXPANDED_W = 168;
const EXPANDED_H = 60;
const WINDOW = 12;

function buildPolyline(
  data: number[],
  tick: number,
  w: number,
  h: number,
  pad = 2,
): { points: string; min: number; max: number } {
  if (data.length === 0) return { points: '', min: 0, max: 0 };
  const N = WINDOW;
  // Scrolling window: shift sample-start forward each tick
  const start = ((tick % data.length) + data.length) % data.length;
  const slice: number[] = [];
  for (let i = 0; i < N; i++) {
    slice.push(data[(start + i) % data.length]);
  }
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const range = max - min || 1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const points = slice
    .map((v, i) => {
      const x = pad + (i / (N - 1)) * innerW;
      const y = pad + innerH - ((v - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return { points, min, max };
}

export function InlineChart({ cx, cy, data, mode, tick, color, unit }: Props) {
  const { theme, mode: themeMode } = useTheme();
  const isInstrument = theme === 'instrument';
  const isDark = themeMode === 'dark';
  const w = mode === 'expanded' ? EXPANDED_W : COMPACT_W;
  const h = mode === 'expanded' ? EXPANDED_H : COMPACT_H;
  const lineColor = color ?? (isInstrument ? 'var(--fg)' : 'var(--ok)');
  const safeData = data.length > 0 ? data : [0];
  const { points, min, max } = buildPolyline(safeData, tick, w, h);
  const x = cx - w / 2;
  const y = cy - h / 2;

  return (
    <g pointerEvents="none" transform={`translate(${x}, ${y})`}>
      {/* Background panel */}
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="var(--panel)"
        stroke="var(--line)"
        strokeWidth={0.8}
        rx={isInstrument ? 0 : 3}
        opacity={isInstrument ? 0.92 : 0.86}
      />
      {/* Faint baseline */}
      <line
        x1={2}
        y1={h / 2}
        x2={w - 2}
        y2={h / 2}
        stroke="var(--line-hi)"
        strokeWidth="0.4"
        strokeDasharray="2 3"
        opacity={0.6}
      />
      {/* Polyline */}
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={mode === 'expanded' ? 1.4 : 1.1}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{
          filter: !isInstrument && isDark ? `drop-shadow(0 0 3px ${lineColor})` : undefined,
        }}
      />
      {mode === 'expanded' && (
        <>
          {/* NOW marker */}
          <line
            x1={w * 0.7}
            y1={2}
            x2={w * 0.7}
            y2={h - 2}
            stroke="var(--fg-3)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
          <text
            x={w - 4}
            y={10}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="7"
            letterSpacing="0.06em"
            fill="var(--fg-3)"
          >
            {`${max.toFixed(2)} ${unit ?? 'MW'}`}
          </text>
          <text
            x={w - 4}
            y={h - 4}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="7"
            letterSpacing="0.06em"
            fill="var(--fg-3)"
          >
            {`${min.toFixed(2)}`}
          </text>
          <text
            x={4}
            y={10}
            textAnchor="start"
            fontFamily="var(--font-mono)"
            fontSize="7"
            letterSpacing="0.08em"
            fill="var(--fg-3)"
          >
            LIVE
          </text>
        </>
      )}
    </g>
  );
}

export const KEY_NODE_IDS = ['BESS-01', 'PV-1', 'UTIL', 'FC-01'];
