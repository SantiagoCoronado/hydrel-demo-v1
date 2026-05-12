import type { AssetKind } from '@/data/assets';

const BOX = 52;

interface Props {
  kind: AssetKind;
  off?: boolean;
  stroke?: string;
  fill?: string;
}

export function NodeSymbol({ kind, off = false, stroke, fill }: Props) {
  const sw = stroke ?? (off ? 'var(--fg-3)' : 'var(--fg)');
  const fc = fill ?? 'var(--panel)';
  const half = BOX / 2;

  return (
    <svg width={BOX} height={BOX} viewBox={`${-half} ${-half} ${BOX} ${BOX}`} fill="none">
      <rect x={-half} y={-half} width={BOX} height={BOX} stroke={sw} strokeWidth="1" fill={fc} />
      {kind === 'PV' && (
        <g stroke={sw} strokeWidth="0.9">
          <line x1={-22} y1={-8} x2={22} y2={-8} />
          <line x1={-22} y1={8} x2={22} y2={8} />
          <line x1={-8} y1={-22} x2={-8} y2={22} />
          <line x1={8} y1={-22} x2={8} y2={22} />
        </g>
      )}
      {kind === 'WT' && (
        <g stroke={sw} strokeWidth="1.2">
          <circle cx={0} cy={0} r={3.2} fill={sw} stroke="none" />
          <line x1={0} y1={0} x2={0} y2={-18} />
          <line x1={0} y1={0} x2={15} y2={9} />
          <line x1={0} y1={0} x2={-15} y2={9} />
        </g>
      )}
      {kind === 'BAT' && (
        <g stroke={sw} strokeWidth="1">
          <rect x={-12} y={-8} width={24} height={12} rx={1} fill="none" />
          <rect x={11} y={-3} width={3} height={6} fill={sw} stroke="none" />
          <line x1={-9} y1={-12} x2={-9} y2={-16} />
          <line x1={-11} y1={-14} x2={-7} y2={-14} />
          <line x1={5} y1={-12} x2={5} y2={-16} />
          <line x1={3} y1={-14} x2={7} y2={-14} />
          <line x1={-2} y1={6} x2={-2} y2={14} />
          <line x1={2} y1={6} x2={2} y2={14} />
        </g>
      )}
      {kind === 'DG' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          <circle cx={0} cy={0} r={13} />
          <text x={0} y={4} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            DG
          </text>
        </g>
      )}
      {(kind === 'L' || kind === 'HVAC') && (
        <path d="M -10 -10 L 10 0 L -10 10 Z" stroke={sw} strokeWidth="1" fill={fc} />
      )}
      {kind === 'EV' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          <rect x={-10} y={-10} width={20} height={20} rx={2} />
          <line x1={-6} y1={-12} x2={-6} y2={-16} />
          <line x1={6} y1={-12} x2={6} y2={-16} />
          <line x1={0} y1={10} x2={0} y2={14} />
        </g>
      )}
      {(kind === 'G' || kind === 'BUS' || kind === 'X' || kind === 'BRK' || kind === 'CHP' || kind === 'TES' || kind === 'H2') && (
        <g stroke={sw} strokeWidth="1">
          <line x1={-14} y1={-9} x2={14} y2={-9} />
          <line x1={-14} y1={-3} x2={14} y2={-3} />
          <line x1={-14} y1={3} x2={14} y2={3} />
          <line x1={-14} y1={9} x2={14} y2={9} />
        </g>
      )}
    </svg>
  );
}
