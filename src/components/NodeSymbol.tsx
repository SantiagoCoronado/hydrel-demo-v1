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
      {kind === 'FC' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          {/* Stacked fuel-cell plates */}
          <line x1={-14} y1={-10} x2={14} y2={-10} />
          <line x1={-14} y1={-4} x2={14} y2={-4} />
          <line x1={-14} y1={2} x2={14} y2={2} />
          <line x1={-14} y1={8} x2={14} y2={8} />
          <circle cx={0} cy={-1} r={2} fill={sw} stroke="none" />
          <text x={0} y={20} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            FC
          </text>
        </g>
      )}
      {kind === 'ELEC' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          {/* Water-drop split */}
          <path d="M 0 -16 Q -10 -4 -8 4 Q -8 12 0 14 Q 8 12 8 4 Q 10 -4 0 -16 Z" />
          <line x1={-3} y1={-2} x2={3} y2={-2} />
          <text x={-7} y={11} textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            H
          </text>
          <text x={7} y={11} textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            O
          </text>
        </g>
      )}
      {kind === 'METH' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          {/* Beaker outline */}
          <path d="M -8 -10 L -8 -14 L 8 -14 L 8 -10 L 12 8 Q 12 14 6 14 L -6 14 Q -12 14 -12 8 Z" />
          <text x={0} y={4} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            CH₄
          </text>
        </g>
      )}
      {kind === 'H2T' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          {/* Vertical tank silhouette */}
          <path d="M -8 -12 Q -8 -16 0 -16 Q 8 -16 8 -12 L 8 12 Q 8 16 0 16 Q -8 16 -8 12 Z" />
          <line x1={-8} y1={-6} x2={8} y2={-6} strokeDasharray="2 2" />
          <text x={0} y={4} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            H₂
          </text>
        </g>
      )}
      {kind === 'CO2C' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          {/* Three downward arrows into a box */}
          <line x1={-8} y1={-16} x2={-8} y2={-6} />
          <line x1={0} y1={-16} x2={0} y2={-6} />
          <line x1={8} y1={-16} x2={8} y2={-6} />
          <polyline points="-10,-9 -8,-6 -6,-9" />
          <polyline points="-2,-9 0,-6 2,-9" />
          <polyline points="6,-9 8,-6 10,-9" />
          <rect x={-12} y={-4} width={24} height={16} />
          <text x={0} y={8} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            CO₂
          </text>
        </g>
      )}
      {kind === 'HP' && (
        <g stroke={sw} strokeWidth="1" fill="none">
          <circle cx={0} cy={0} r={13} />
          {/* Opposed arrows for heat in/out */}
          <polyline points="-5,-9 -7,-12 -3,-12" />
          <line x1={-5} y1={-9} x2={5} y2={9} />
          <polyline points="5,9 7,12 3,12" />
          <text x={0} y={3} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill={sw} stroke="none">
            HP
          </text>
        </g>
      )}
    </svg>
  );
}
