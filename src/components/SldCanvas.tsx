import { useRef, useState } from 'react';
import { useTheme } from '@/lib/theme';
import { NodeSymbol } from './NodeSymbol';
import { SOURCES, LOADS, UTILITY, type Asset } from '@/data/assets';

const BUS_X = 480;
const BUS_TOP = 112;
const BUS_BOTTOM = 466;
const NODE_W = 56;

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

function FlowTag({
  x,
  y,
  primary,
  secondary,
  color,
  variant,
  align = 'middle',
}: {
  x: number;
  y: number;
  primary: string;
  secondary: string;
  color: string;
  variant: 'helios' | 'instrument';
  align?: 'middle' | 'start' | 'end';
}) {
  if (variant === 'instrument') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <line x1={0} y1={0} x2={0} y2={-8} stroke="var(--fg-3)" strokeWidth="0.6" strokeDasharray="2 2" />
        <text
          y={-14}
          textAnchor={align}
          fontFamily="var(--font-mono)"
          fontSize="9"
          letterSpacing="0.08em"
          fill="var(--fg)"
        >
          {primary}
        </text>
        <text
          y={-26}
          textAnchor={align}
          fontFamily="var(--font-mono)"
          fontSize="8"
          letterSpacing="0.12em"
          fill="var(--fg-3)"
        >
          {secondary}
        </text>
      </g>
    );
  }
  const w = Math.max(54, primary.length * 7 + 8);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-w / 2}
        y={-30}
        width={w}
        height={26}
        rx={4}
        fill="var(--panel)"
        stroke="var(--line)"
      />
      <text y={-18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600" fill={color}>
        {primary}
      </text>
      <text y={-8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.08em" fill="var(--fg-3)">
        {secondary}
      </text>
    </g>
  );
}

function Breaker({ x, y, open, stroke }: { x: number; y: number; open: boolean; stroke: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-6} y={-6} width={12} height={12} fill="var(--panel)" stroke={stroke} strokeWidth="1" />
      <line
        x1={-4}
        y1={-4}
        x2={4}
        y2={4}
        stroke={stroke}
        strokeWidth="1.4"
        transform={open ? 'rotate(35)' : 'rotate(0)'}
      />
    </g>
  );
}

function Inverter({ x, y, stroke }: { x: number; y: number; stroke: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={9} fill="var(--panel)" stroke={stroke} strokeWidth="1" />
      <text y={-1} textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fill={stroke}>
        ~
      </text>
      <text y={6} textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fill={stroke}>
        =
      </text>
    </g>
  );
}

function Transformer({ x, y, stroke }: { x: number; y: number; stroke: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={0} cy={-6} r={7} fill="var(--panel)" stroke={stroke} strokeWidth="1" />
      <circle cx={0} cy={4} r={7} fill="var(--panel)" stroke={stroke} strokeWidth="1" />
    </g>
  );
}

function SelectionFrame({
  cx,
  cy,
  variant,
}: {
  cx: number;
  cy: number;
  variant: 'helios' | 'instrument';
}) {
  const size = 68;
  const half = size / 2;
  if (variant === 'instrument') {
    const corner = 5;
    return (
      <g pointerEvents="none">
        <rect
          x={cx - half}
          y={cy - half}
          width={size}
          height={size}
          stroke="var(--fg)"
          strokeWidth="1"
          strokeDasharray="3 2"
          fill="none"
        />
        {[
          [cx - half, cy - half],
          [cx + half - corner, cy - half],
          [cx - half, cy + half - corner],
          [cx + half - corner, cy + half - corner],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={corner} height={corner} fill="var(--fg)" />
        ))}
      </g>
    );
  }
  return (
    <g pointerEvents="none">
      <rect
        x={cx - half}
        y={cy - half}
        width={size}
        height={size}
        stroke="var(--accent)"
        strokeWidth="1.4"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 6px var(--accent))' }}
      />
    </g>
  );
}

export function SldCanvas({ selectedId, onSelect }: Props) {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const VIEW_W = 960;
  const VIEW_H = 510;

  const utility = UTILITY;
  const sources = SOURCES;
  const loads = LOADS;

  const flowColor = isInstrument ? 'var(--fg)' : 'var(--ok)';

  // Find positions for selection ring
  const selectedAsset =
    [utility, ...sources, ...loads].find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex-1 min-h-0 relative" ref={containerRef} style={{ background: 'var(--bg)' }}>
      {/* Top toolbar in canvas */}
      <div
        className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1.5 border"
        style={{
          background: 'var(--panel)',
          borderColor: 'var(--line)',
          borderRadius: isInstrument ? 2 : 6,
        }}
      >
        <button
          className="font-mono text-[var(--fg-2)] hover:text-[var(--fg)] px-1"
          style={{ fontSize: 11 }}
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
        >
          −
        </button>
        <span className="font-mono tabular-nums text-[var(--fg-3)]" style={{ fontSize: 10 }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="font-mono text-[var(--fg-2)] hover:text-[var(--fg)] px-1"
          style={{ fontSize: 11 }}
          onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
        >
          +
        </button>
        <span className="text-[var(--fg-3)] mx-1">|</span>
        <button
          className="font-mono uppercase text-[var(--fg-2)] hover:text-[var(--fg)]"
          style={{ fontSize: 10, letterSpacing: '0.1em' }}
          onClick={() => setZoom(1)}
        >
          FIT
        </button>
      </div>

      <div
        className="absolute top-3 right-3 z-10 font-mono uppercase text-[var(--fg-3)]"
        style={{ fontSize: 10, letterSpacing: '0.12em' }}
      >
        {isInstrument ? 'SLD · MAIN · 13.8 KV' : 'Single-line diagram · 13.8 kV'}
      </div>

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <svg
          width={VIEW_W * zoom}
          height={VIEW_H * zoom}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          style={{ transition: 'width 200ms ease, height 200ms ease' }}
        >
          <defs>
            <pattern id="sld-grid-helios" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--line)" strokeWidth="1" />
            </pattern>
            <pattern id="sld-grid-instrument" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.8" fill="var(--line)" />
            </pattern>
            <marker
              id="arrow-ok"
              viewBox="0 0 8 8"
              refX="6"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill={flowColor} />
            </marker>
            <marker
              id="arrow-warn"
              viewBox="0 0 8 8"
              refX="6"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill="var(--warn)" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect
            width={VIEW_W}
            height={VIEW_H}
            fill={isInstrument ? 'url(#sld-grid-instrument)' : 'url(#sld-grid-helios)'}
            opacity={isInstrument ? 0.7 : 0.55}
          />

          {/* Corner registration marks for Instrument */}
          {isInstrument && (
            <g stroke="var(--fg-2)" strokeWidth="1" fill="none">
              <path d="M 8 8 L 8 22 M 8 8 L 22 8" />
              <path d={`M ${VIEW_W - 8} 8 L ${VIEW_W - 8} 22 M ${VIEW_W - 8} 8 L ${VIEW_W - 22} 8`} />
              <path d={`M 8 ${VIEW_H - 8} L 8 ${VIEW_H - 22} M 8 ${VIEW_H - 8} L 22 ${VIEW_H - 8}`} />
              <path
                d={`M ${VIEW_W - 8} ${VIEW_H - 8} L ${VIEW_W - 8} ${VIEW_H - 22} M ${VIEW_W - 8} ${
                  VIEW_H - 8
                } L ${VIEW_W - 22} ${VIEW_H - 8}`}
              />
            </g>
          )}

          {/* MAIN BUS */}
          <rect
            x={BUS_X - (isInstrument ? 3 : 4)}
            y={BUS_TOP}
            width={isInstrument ? 6 : 8}
            height={BUS_BOTTOM - BUS_TOP}
            fill={isInstrument ? 'var(--fg)' : '#16223a'}
            stroke={isInstrument ? 'var(--fg)' : 'var(--line-hi)'}
            strokeWidth="0.5"
          />
          <text
            x={BUS_X}
            y={BUS_TOP - 12}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={isInstrument ? 10 : 11}
            fontWeight="500"
            letterSpacing="0.08em"
            fill="var(--fg-2)"
          >
            {isInstrument ? 'MAIN-BUS · 13.8 KV · 60 HZ' : 'MAIN-BUS · 13.8 kV'}
          </text>

          {/* UTILITY intertie at top of bus */}
          <g>
            <line
              x1={BUS_X}
              y1={BUS_TOP - 2}
              x2={BUS_X}
              y2={86}
              stroke="var(--warn)"
              strokeWidth="2"
              strokeDasharray="3 5"
              className={isInstrument ? '' : 'ants'}
              markerEnd="url(#arrow-warn)"
            />
            <Transformer x={BUS_X} y={66} stroke="var(--fg-2)" />
            <Breaker x={BUS_X} y={42} open={false} stroke="var(--fg-2)" />
            <line x1={BUS_X} y1={26} x2={BUS_X} y2={36} stroke="var(--fg-2)" strokeWidth="1" />
            <g
              onClick={() => onSelect('UTIL')}
              style={{ cursor: 'pointer' }}
              transform={`translate(${BUS_X}, ${utility.position.y})`}
            >
              <foreignObject x={-NODE_W / 2} y={-NODE_W / 2} width={NODE_W} height={NODE_W}>
                <div style={{ width: NODE_W, height: NODE_W }}>
                  <NodeSymbol kind="G" />
                </div>
              </foreignObject>
              <text
                y={-NODE_W / 2 - 6}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={isInstrument ? 10 : 11}
                fontWeight="600"
                fill="var(--fg)"
              >
                UTILITY
              </text>
            </g>
            <FlowTag
              x={BUS_X + 60}
              y={66}
              primary="0.41 MW"
              secondary="IMPORT"
              color="var(--warn)"
              variant={isInstrument ? 'instrument' : 'helios'}
            />
          </g>

          {/* SOURCES (left side) */}
          {sources.map((n) => {
            const off = n.status === 'idle';
            const stroke = off ? 'var(--fg-3)' : flowColor;
            const cx = n.position.x;
            const cy = n.position.y;
            const inverterX = cx + NODE_W / 2 + 30;
            const breakerX = cx + NODE_W / 2 + 80;
            return (
              <g key={n.id}>
                {/* node → inverter */}
                <line
                  x1={cx + NODE_W / 2}
                  y1={cy}
                  x2={inverterX - 9}
                  y2={cy}
                  stroke="var(--fg-2)"
                  strokeWidth="1"
                />
                {n.code !== 'DG' && <Inverter x={inverterX} y={cy} stroke="var(--fg-2)" />}
                {/* inverter → breaker */}
                <line
                  x1={inverterX + (n.code !== 'DG' ? 9 : -9)}
                  y1={cy}
                  x2={breakerX - 6}
                  y2={cy}
                  stroke="var(--fg-2)"
                  strokeWidth="1"
                />
                <Breaker x={breakerX} y={cy} open={off} stroke={off ? 'var(--fg-3)' : 'var(--fg-2)'} />
                {/* breaker → bus (animated flow) */}
                <line
                  x1={breakerX + 6}
                  y1={cy}
                  x2={BUS_X - 4}
                  y2={cy}
                  stroke={off ? 'var(--fg-3)' : stroke}
                  strokeWidth={off ? '1' : '1.6'}
                  strokeDasharray={off ? '2 4' : '4 6'}
                  opacity={off ? 0.45 : 1}
                  className={!off && !isInstrument ? 'ants' : ''}
                  markerEnd={off ? undefined : 'url(#arrow-ok)'}
                />
                {/* Node */}
                <g
                  onClick={() => onSelect(n.id)}
                  style={{ cursor: 'pointer' }}
                  transform={`translate(${cx}, ${cy})`}
                >
                  <foreignObject x={-NODE_W / 2} y={-NODE_W / 2} width={NODE_W} height={NODE_W}>
                    <div style={{ width: NODE_W, height: NODE_W }}>
                      <NodeSymbol kind={n.code} off={off} />
                    </div>
                  </foreignObject>
                  <text
                    y={-NODE_W / 2 - 6}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize={isInstrument ? 10 : 11}
                    fontWeight="600"
                    fill={off ? 'var(--fg-3)' : 'var(--fg)'}
                  >
                    {n.name}
                  </text>
                  <text
                    y={NODE_W / 2 + 14}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    letterSpacing="0.06em"
                    fill="var(--fg-3)"
                  >
                    {n.description}
                  </text>
                </g>
                <FlowTag
                  x={(breakerX + BUS_X) / 2}
                  y={cy}
                  primary={n.flow.label.split(' · ')[0]}
                  secondary={n.flow.label.split(' · ')[1] ?? ''}
                  color={off ? 'var(--fg-3)' : stroke}
                  variant={isInstrument ? 'instrument' : 'helios'}
                />
              </g>
            );
          })}

          {/* LOADS (right side) */}
          {loads.map((n) => {
            const stroke = flowColor;
            const cx = n.position.x;
            const cy = n.position.y;
            const breakerX = cx - NODE_W / 2 - 40;
            return (
              <g key={n.id}>
                {/* bus → breaker */}
                <line
                  x1={BUS_X + 4}
                  y1={cy}
                  x2={breakerX - 6}
                  y2={cy}
                  stroke={stroke}
                  strokeWidth="1.6"
                  strokeDasharray="4 6"
                  className={!isInstrument ? 'ants' : ''}
                  markerEnd="url(#arrow-ok)"
                />
                <Breaker x={breakerX} y={cy} open={false} stroke="var(--fg-2)" />
                {/* breaker → node */}
                <line
                  x1={breakerX + 6}
                  y1={cy}
                  x2={cx - NODE_W / 2}
                  y2={cy}
                  stroke="var(--fg-2)"
                  strokeWidth="1"
                />
                {/* Node */}
                <g
                  onClick={() => onSelect(n.id)}
                  style={{ cursor: 'pointer' }}
                  transform={`translate(${cx}, ${cy})`}
                >
                  <foreignObject x={-NODE_W / 2} y={-NODE_W / 2} width={NODE_W} height={NODE_W}>
                    <div style={{ width: NODE_W, height: NODE_W }}>
                      <NodeSymbol kind={n.code} />
                    </div>
                  </foreignObject>
                  <text
                    y={-NODE_W / 2 - 6}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize={isInstrument ? 10 : 11}
                    fontWeight="600"
                    fill="var(--fg)"
                  >
                    {n.name}
                  </text>
                  <text
                    y={NODE_W / 2 + 14}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    letterSpacing="0.06em"
                    fill="var(--fg-3)"
                  >
                    {n.description}
                  </text>
                </g>
                <FlowTag
                  x={(BUS_X + breakerX) / 2}
                  y={cy}
                  primary={n.flow.label}
                  secondary="LOAD"
                  color={
                    n.status === 'warn' ? 'var(--warn)' : stroke
                  }
                  variant={isInstrument ? 'instrument' : 'helios'}
                />
              </g>
            );
          })}

          {/* Selection frame */}
          {selectedAsset && (
            <SelectionFrame
              cx={selectedAsset.position.x}
              cy={selectedAsset.position.y}
              variant={isInstrument ? 'instrument' : 'helios'}
            />
          )}
        </svg>
      </div>

      {/* Minimap (Helios only) */}
      {!isInstrument && (
        <div
          className="absolute bottom-3 right-3 border"
          style={{
            width: 140,
            height: 90,
            background: 'var(--panel)',
            borderColor: 'var(--line)',
            borderRadius: 6,
            boxShadow: mode === 'dark' ? '0 6px 24px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 960 510" preserveAspectRatio="xMidYMid meet">
            <rect
              x={BUS_X - 4}
              y={BUS_TOP}
              width="8"
              height={BUS_BOTTOM - BUS_TOP}
              fill="var(--accent)"
              opacity="0.55"
            />
            {[utility, ...sources, ...loads].map((n) => (
              <rect
                key={n.id}
                x={n.position.x - 18}
                y={n.position.y - 18}
                width="36"
                height="36"
                fill="var(--fg-3)"
                opacity="0.5"
              />
            ))}
            {selectedAsset && (
              <rect
                x={selectedAsset.position.x - 22}
                y={selectedAsset.position.y - 22}
                width="44"
                height="44"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
              />
            )}
          </svg>
        </div>
      )}
    </div>
  );
}

// re-export type for callers
export type { Asset };
