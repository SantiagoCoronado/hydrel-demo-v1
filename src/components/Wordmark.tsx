import { useTheme } from '@/lib/theme';

function HeliosMark({ size = 28, color, glow }: { size?: number; color: string; glow: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <defs>
        {glow && (
          <filter id="helios-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        )}
      </defs>
      {glow && (
        <g filter="url(#helios-glow)" opacity="0.7">
          <circle cx="28" cy="28" r="20" stroke={color} strokeWidth="1.2" fill="none" />
        </g>
      )}
      <circle cx="28" cy="28" r="20" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="28" cy="28" r="13" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <path
        d="M10 28 L20 28 L24 20 L32 36 L36 28 L46 28"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28" cy="28" r="2.2" fill={color} />
    </svg>
  );
}

function InstrumentMark({ size = 28, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="6.5" y="6.5" width="43" height="43" stroke={color} strokeWidth="1" fill="none" />
      <line x1="6.5" y1="18" x2="49.5" y2="18" stroke={color} strokeWidth="0.5" />
      <line x1="6.5" y1="38" x2="49.5" y2="38" stroke={color} strokeWidth="0.5" />
      <text x="11" y="15" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill={color} letterSpacing="0.5">
        HYD/01
      </text>
      <g transform="translate(13,21)">
        <rect width="6" height="14" fill={color} opacity="0.85" />
        <rect x="8" width="6" height="14" fill={color} opacity="0.55" />
        <rect x="16" width="6" height="14" fill={color} opacity="0.35" />
        <rect x="24" width="6" height="14" fill="none" stroke={color} />
      </g>
      <text x="11" y="46" fontFamily="IBM Plex Mono, monospace" fontSize="5" fill={color} letterSpacing="0.5">
        28.4kW · OK
      </text>
    </svg>
  );
}

export function Wordmark({ size = 16, compact = false }: { size?: number; compact?: boolean }) {
  const { theme, mode } = useTheme();
  const markSize = Math.round(size * 1.7);

  if (theme === 'instrument') {
    return (
      <div className="flex items-center gap-3">
        <InstrumentMark size={markSize} color="var(--fg)" />
        {!compact && (
          <div className="leading-tight">
            <div className="font-mono font-medium text-[var(--fg)]" style={{ fontSize: size, letterSpacing: '-0.01em' }}>
              HYDREL
            </div>
            <div
              className="font-mono text-[var(--fg-3)] mt-0.5"
              style={{ fontSize: Math.round(size * 0.38), letterSpacing: '0.2em' }}
            >
              POWER CONTROLS
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <HeliosMark size={markSize} color="var(--accent)" glow={mode === 'dark'} />
      {!compact && (
        <div
          className="font-sans font-semibold text-[var(--fg)]"
          style={{ fontSize: size, letterSpacing: '-0.03em' }}
        >
          Hydrel
        </div>
      )}
    </div>
  );
}
