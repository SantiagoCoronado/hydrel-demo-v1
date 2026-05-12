import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/lib/theme';
import { NodeSymbol } from './NodeSymbol';
import type { Asset } from '@/data/assets';
import { useBuilder } from '@/lib/builder-store';
import { PALETTE_DRAG_MIME } from './Palette';
import { BUS_X, NODE_W, screenToSvg } from '@/lib/sld-layout';
import type { AssetKind } from '@/data/assets';
import { InlineChart, KEY_NODE_IDS } from './InlineChart';
import { DISPATCH_4H } from '@/data/timeseries';

const VIEW_W_MIN = 960;
const VIEW_H_MIN = 510;
const BUS_TOP_MIN = 112;
const BUS_BOTTOM_MIN = 466;
const DRAG_THRESHOLD = 4;

function FlowTag({
  x,
  y,
  primary,
  secondary,
  color,
  variant,
  align = 'middle',
  dim = false,
}: {
  x: number;
  y: number;
  primary: string;
  secondary: string;
  color: string;
  variant: 'helios' | 'instrument';
  align?: 'middle' | 'start' | 'end';
  dim?: boolean;
}) {
  if (variant === 'instrument') {
    return (
      <g transform={`translate(${x}, ${y})`} opacity={dim ? 0.45 : 1} pointerEvents="none">
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
    <g transform={`translate(${x}, ${y})`} opacity={dim ? 0.45 : 1} pointerEvents="none">
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

function Breaker({
  x,
  y,
  open,
  stroke,
  onClick,
  interactive,
}: {
  x: number;
  y: number;
  open: boolean;
  stroke: string;
  onClick?: (e: React.MouseEvent<SVGGElement>) => void;
  interactive?: boolean;
}) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {/* Hit area */}
      <rect x={-10} y={-10} width={20} height={20} fill="transparent" />
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
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
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
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
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

const TOOLS: { code: 'select' | 'pan' | 'wire' | 'measure'; label: string }[] = [
  { code: 'select', label: 'SELECT' },
  { code: 'pan', label: 'PAN' },
  { code: 'wire', label: 'WIRE' },
  { code: 'measure', label: 'MEASURE' },
];

export function SldCanvas() {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';
  const variant = isInstrument ? ('instrument' as const) : ('helios' as const);
  const { state, dispatch } = useBuilder();
  const { nodes, wires, breakers, selectedId, selectedWireId, tool, wireFrom, measure, pan, simulating } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [dropHover, setDropHover] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{
    id: string;
    startClient: { x: number; y: number };
    startPos: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const panState = useRef<{ startClient: { x: number; y: number }; startPan: { x: number; y: number } } | null>(null);

  const flowColor = isInstrument ? 'var(--fg)' : 'var(--ok)';

  // Partition nodes
  const utility = nodes.find((n) => n.side === 'utility') ?? null;
  const sources = nodes.filter((n) => n.side === 'source');
  const loads = nodes.filter((n) => n.side === 'load');

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  // Auto-fit canvas + bus extent to current topology. We pad the bottom by 140px
  // to leave room for the inline chart strip rendered below each key/selected node.
  const { VIEW_W, VIEW_H, busTop, busBottom } = useMemo(() => {
    const sourcesAndLoads = nodes.filter((n) => n.side !== 'utility');
    const topFromUtil = utility ? utility.position.y + 100 : BUS_TOP_MIN;
    const _busTop = Math.max(BUS_TOP_MIN, topFromUtil);
    const bottomFromNodes = sourcesAndLoads.length > 0
      ? Math.max(...sourcesAndLoads.map((n) => n.position.y + 50))
      : 0;
    const _busBottom = Math.max(_busTop + 100, bottomFromNodes, BUS_BOTTOM_MIN);
    const xs = nodes.map((n) => n.position.x + 200);
    const _VIEW_W = Math.max(VIEW_W_MIN, ...(xs.length ? xs : [0]));
    const ys = nodes.map((n) => n.position.y + 140);
    const _VIEW_H = Math.max(VIEW_H_MIN, _busBottom + 60, ...(ys.length ? ys : [0]));
    return { VIEW_W: _VIEW_W, VIEW_H: _VIEW_H, busTop: _busTop, busBottom: _busBottom };
  }, [nodes, utility]);

  // Keyboard: Delete key removes selected node/wire
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWireId) {
          e.preventDefault();
          dispatch({ type: 'DELETE_WIRE', id: selectedWireId });
        } else if (selectedId && selectedId !== utility?.id) {
          e.preventDefault();
          dispatch({ type: 'DELETE_NODE', id: selectedId });
        }
      } else if (e.key === 'Escape') {
        dispatch({ type: 'WIRE_FROM', id: null });
        dispatch({ type: 'MEASURE_RESET' });
      } else if (e.key.toLowerCase() === 'v') {
        dispatch({ type: 'SET_TOOL', tool: 'select' });
      } else if (e.key.toLowerCase() === 'h') {
        dispatch({ type: 'SET_TOOL', tool: 'pan' });
      } else if (e.key.toLowerCase() === 'w') {
        dispatch({ type: 'SET_TOOL', tool: 'wire' });
      } else if (e.key.toLowerCase() === 'm') {
        dispatch({ type: 'SET_TOOL', tool: 'measure' });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, selectedWireId, utility?.id, dispatch]);

  // Live oscilloscope tick — drives InlineChart scrolling
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    if (simulating) return;
    const id = setInterval(() => setLiveTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [simulating]);

  // Compute pulse animation: when simulating, flow values shimmer
  const [pulseTick, setPulseTick] = useState(0);
  useEffect(() => {
    if (!simulating) return;
    const start = Date.now();
    const id = setInterval(() => {
      setPulseTick((t) => t + 1);
      if (Date.now() - start > 1500) {
        clearInterval(id);
        dispatch({ type: 'SET_SIMULATING', on: false });
        dispatch({ type: 'RECOMPUTE' });
      }
    }, 90);
    return () => clearInterval(id);
  }, [simulating, dispatch]);

  // Drop from palette
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover(false);
    const code = (e.dataTransfer.getData(PALETTE_DRAG_MIME) || e.dataTransfer.getData('text/plain')) as AssetKind;
    if (!code) return;
    if (!svgRef.current) return;
    const { x, y } = screenToSvg(svgRef.current, e.clientX, e.clientY);
    // Subtract pan: position is in pan-group coords
    dispatch({ type: 'ADD_NODE', code, position: { x: x - pan.x, y: y - pan.y } });
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropHover(true);
    if (svgRef.current) {
      const { x, y } = screenToSvg(svgRef.current, e.clientX, e.clientY);
      // hoverPoint is rendered outside pan group, so keep raw SVG coords
      setHoverPoint({ x, y });
    }
  };

  const onDragLeave = () => {
    setDropHover(false);
    setHoverPoint(null);
  };

  // Node pointer handling: click vs drag
  const onNodePointerDown = (e: React.PointerEvent<SVGGElement>, node: Asset) => {
    if (tool === 'pan') return;
    if (tool === 'wire') {
      e.stopPropagation();
      handleWireClick(node.id);
      return;
    }
    if (tool === 'measure') {
      // Let canvas-level handler take it
      return;
    }
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      id: node.id,
      startClient: { x: e.clientX, y: e.clientY },
      startPos: { ...node.position },
      moved: false,
    };
  };

  const onNodePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const ds = dragState.current;
    if (!ds) return;
    const dx = e.clientX - ds.startClient.x;
    const dy = e.clientY - ds.startClient.y;
    if (!ds.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    ds.moved = true;
    if (!svgRef.current) return;
    // Convert screen delta to SVG delta via two CTM transforms
    const a = screenToSvg(svgRef.current, ds.startClient.x, ds.startClient.y);
    const b = screenToSvg(svgRef.current, e.clientX, e.clientY);
    const newPos = { x: ds.startPos.x + (b.x - a.x), y: ds.startPos.y + (b.y - a.y) };
    dispatch({ type: 'MOVE_NODE', id: ds.id, position: newPos });
  };

  const onNodePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const ds = dragState.current;
    if (!ds) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!ds.moved) {
      dispatch({ type: 'SELECT', id: ds.id });
    }
    dragState.current = null;
  };

  // Wire-tool click handler
  const handleWireClick = (id: string) => {
    if (!wireFrom) {
      dispatch({ type: 'WIRE_FROM', id });
    } else if (wireFrom !== id) {
      dispatch({ type: 'ADD_WIRE', from: wireFrom, to: id });
    } else {
      dispatch({ type: 'WIRE_FROM', id: null });
    }
  };

  // Background pointer handling: PAN tool + MEASURE tool + click-to-deselect
  const onBgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (tool === 'pan') {
      e.stopPropagation();
      panState.current = {
        startClient: { x: e.clientX, y: e.clientY },
        startPan: { ...pan },
      };
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      return;
    }
    if (tool === 'measure') {
      if (!svgRef.current) return;
      const p = screenToSvg(svgRef.current, e.clientX, e.clientY);
      // Measure overlay is rendered inside the panned group
      dispatch({ type: 'MEASURE_POINT', point: { x: p.x - pan.x, y: p.y - pan.y } });
      return;
    }
    if (tool === 'wire') {
      // clicking empty space cancels wire-in-progress
      if (wireFrom) dispatch({ type: 'WIRE_FROM', id: null });
      return;
    }
    // SELECT mode: deselect on background click
    dispatch({ type: 'SELECT', id: null });
  };

  const onBgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const ps = panState.current;
    if (!ps) return;
    if (!svgRef.current) return;
    const a = screenToSvg(svgRef.current, ps.startClient.x, ps.startClient.y);
    const b = screenToSvg(svgRef.current, e.clientX, e.clientY);
    dispatch({ type: 'PAN_SET', x: ps.startPan.x + (b.x - a.x), y: ps.startPan.y + (b.y - a.y) });
  };

  const onBgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (panState.current) {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      panState.current = null;
    }
  };

  // Pulse-shimmer helper: when simulating, flow tag colors fade in/out
  const pulseDim = simulating && pulseTick % 2 === 0;

  return (
    <div
      className="flex-1 min-h-0 relative"
      ref={containerRef}
      style={{ background: 'var(--bg)' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Top toolbar — tools + zoom */}
      <div
        className="absolute top-3 left-3 z-10 flex items-center gap-1 px-1.5 py-1 border"
        style={{
          background: 'var(--panel)',
          borderColor: 'var(--line)',
          borderRadius: isInstrument ? 2 : 6,
        }}
      >
        {TOOLS.map((t) => {
          const active = tool === t.code;
          return (
            <button
              key={t.code}
              onClick={() => dispatch({ type: 'SET_TOOL', tool: t.code })}
              className="font-mono uppercase px-2 py-1"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                color: active ? 'var(--fg)' : 'var(--fg-3)',
                background: active ? 'var(--sub)' : 'transparent',
                border: active ? '1px solid var(--line)' : '1px solid transparent',
                borderRadius: isInstrument ? 2 : 4,
                cursor: 'pointer',
              }}
              title={`${t.label} (${t.code === 'select' ? 'V' : t.code === 'pan' ? 'H' : t.code === 'wire' ? 'W' : 'M'})`}
            >
              {t.label}
            </button>
          );
        })}
        <span className="text-[var(--fg-3)] mx-1">|</span>
        <button
          className="font-mono text-[var(--fg-2)] hover:text-[var(--fg)] px-1"
          style={{ fontSize: 12 }}
          onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
        >
          −
        </button>
        <span className="font-mono tabular-nums text-[var(--fg-3)]" style={{ fontSize: 10 }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="font-mono text-[var(--fg-2)] hover:text-[var(--fg)] px-1"
          style={{ fontSize: 12 }}
          onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
        >
          +
        </button>
        <button
          className="font-mono uppercase text-[var(--fg-2)] hover:text-[var(--fg)] px-1"
          style={{ fontSize: 10, letterSpacing: '0.1em' }}
          onClick={() => {
            setZoom(1);
            dispatch({ type: 'PAN_RESET' });
          }}
        >
          FIT
        </button>
      </div>

      <div
        className="absolute top-3 right-3 z-10 font-mono uppercase text-[var(--fg-3)] flex flex-col items-end gap-1"
        style={{ fontSize: 10, letterSpacing: '0.12em' }}
      >
        <span>{isInstrument ? 'SLD · MAIN · 13.8 KV' : 'Single-line diagram · 13.8 kV'}</span>
        {tool === 'wire' && (
          <span style={{ color: 'var(--accent)' }}>
            {wireFrom ? `WIRE · FROM ${wireFrom} → CLICK TARGET` : 'WIRE · CLICK SOURCE NODE'}
          </span>
        )}
        {tool === 'measure' && (
          <span style={{ color: 'var(--accent)' }}>
            MEASURE · {measure.length === 0 ? 'CLICK FIRST POINT' : measure.length === 1 ? 'CLICK SECOND POINT' : 'CLICK TO RESET'}
          </span>
        )}
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
      >
        <svg
          ref={svgRef}
          width={VIEW_W * zoom}
          height={VIEW_H * zoom}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          style={{ transition: 'width 200ms ease, height 200ms ease', userSelect: 'none' }}
          onPointerDown={onBgPointerDown}
          onPointerMove={onBgPointerMove}
          onPointerUp={onBgPointerUp}
          onPointerCancel={onBgPointerUp}
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
            <marker
              id="arrow-accent"
              viewBox="0 0 8 8"
              refX="6"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill="var(--accent)" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect
            width={VIEW_W}
            height={VIEW_H}
            fill={isInstrument ? 'url(#sld-grid-instrument)' : 'url(#sld-grid-helios)'}
            opacity={isInstrument ? 0.7 : 0.55}
          />

          {/* Drop hover indicator */}
          {dropHover && hoverPoint && (
            <g pointerEvents="none">
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r={32}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <text
                x={hoverPoint.x}
                y={hoverPoint.y - 40}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="10"
                letterSpacing="0.08em"
                fill="var(--accent)"
              >
                DROP TO PLACE
              </text>
            </g>
          )}

          {/* Pan group */}
          <g transform={`translate(${pan.x}, ${pan.y})`}>
            {/* Corner registration marks for Instrument */}
            {isInstrument && (
              <g stroke="var(--fg-2)" strokeWidth="1" fill="none" pointerEvents="none">
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
              y={busTop}
              width={isInstrument ? 6 : 8}
              height={busBottom - busTop}
              fill={isInstrument ? 'var(--fg)' : '#16223a'}
              stroke={isInstrument ? 'var(--fg)' : 'var(--line-hi)'}
              strokeWidth="0.5"
              pointerEvents="none"
            />
            <text
              x={BUS_X}
              y={busTop - 28}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={isInstrument ? 10 : 11}
              fontWeight="500"
              letterSpacing="0.08em"
              fill="var(--fg-2)"
              pointerEvents="none"
            >
              {isInstrument ? 'MAIN-BUS · 13.8 KV · 60 HZ' : 'MAIN-BUS · 13.8 kV'}
            </text>

            {/* UTILITY intertie — follows utility.position; jogs to BUS_X at the bus */}
            {utility && (() => {
              const ux = utility.position.x;
              const uy = utility.position.y;
              const transformerY = uy + 46;
              const breakerY = uy + 70;
              const connectorTop = breakerY + 6;
              const jogY = busTop - 14;
              const isOpen = !!breakers[utility.id];
              const utilStroke = isOpen ? 'var(--fg-3)' : 'var(--warn)';
              // Polyline path: down from breaker to jog row, then horizontal to BUS_X, then small drop to bus
              const polyPoints = [
                [ux, connectorTop],
                [ux, jogY],
                [BUS_X, jogY],
                [BUS_X, busTop - 2],
              ]
                .map((p) => p.join(','))
                .join(' ');
              return (
                <g>
                  <polyline
                    points={polyPoints}
                    fill="none"
                    stroke={utilStroke}
                    strokeWidth="2"
                    strokeDasharray="3 5"
                    className={isOpen || isInstrument ? '' : 'ants'}
                    markerEnd={isOpen ? undefined : 'url(#arrow-warn)'}
                    pointerEvents="none"
                  />
                  <Transformer x={ux} y={transformerY} stroke="var(--fg-2)" />
                  <Breaker
                    x={ux}
                    y={breakerY}
                    open={isOpen}
                    stroke="var(--fg-2)"
                    interactive
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'TOGGLE_BREAKER', id: utility.id });
                    }}
                  />
                  {/* Stub from utility node to transformer */}
                  <line
                    x1={ux}
                    y1={uy + NODE_W / 2}
                    x2={ux}
                    y2={transformerY - 14}
                    stroke="var(--fg-2)"
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                  {/* Utility node — now draggable */}
                  <g
                    onPointerDown={(e) => onNodePointerDown(e, utility)}
                    onPointerMove={onNodePointerMove}
                    onPointerUp={onNodePointerUp}
                    style={{ cursor: tool === 'wire' ? 'crosshair' : tool === 'pan' ? 'grab' : 'move' }}
                    transform={`translate(${ux}, ${uy})`}
                  >
                    <foreignObject x={-NODE_W / 2} y={-NODE_W / 2} width={NODE_W} height={NODE_W}>
                      <div style={{ width: NODE_W, height: NODE_W }}>
                        <NodeSymbol kind="G" off={isOpen} />
                      </div>
                    </foreignObject>
                    <text
                      y={-NODE_W / 2 - 6}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize={isInstrument ? 10 : 11}
                      fontWeight="600"
                      fill={isOpen ? 'var(--fg-3)' : 'var(--fg)'}
                    >
                      {utility.name}
                    </text>
                    {wireFrom === utility.id && (
                      <circle r={NODE_W / 2 + 8} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
                    )}
                  </g>
                  <FlowTag
                    x={ux + 60}
                    y={breakerY}
                    primary={utility.flow.label.split(' · ')[0] ?? utility.flow.label}
                    secondary={utility.flow.label.split(' · ')[1] ?? ''}
                    color={
                      isOpen
                        ? 'var(--fg-3)'
                        : utility.pillKind === 'warn'
                          ? 'var(--warn)'
                          : utility.pillKind === 'err'
                            ? 'var(--err)'
                            : 'var(--ok)'
                    }
                    variant={variant}
                    dim={pulseDim || isOpen}
                  />
                  {(() => {
                    const isSel = utility.id === selectedId;
                    const isKey = KEY_NODE_IDS.includes(utility.id);
                    if (!isSel && !isKey) return null;
                    if (isOpen) return null;
                    const chartMode: 'compact' | 'expanded' = isSel ? 'expanded' : 'compact';
                    // Place to the right of utility node (above the bus, where there's empty space)
                    return (
                      <InlineChart
                        cx={ux + 100}
                        cy={uy}
                        data={utility.sparkline ?? DISPATCH_4H}
                        mode={chartMode}
                        tick={liveTick}
                        color={utility.pillKind === 'warn' ? 'var(--warn)' : undefined}
                      />
                    );
                  })()}
                </g>
              );
            })()}

            {/* SOURCES (left side) */}
            {sources.map((n) => {
              const off = n.status === 'idle' || !!breakers[n.id];
              const stroke = off ? 'var(--fg-3)' : flowColor;
              const cx = n.position.x;
              const cy = n.position.y;
              // Compute breaker/inverter positions clamped to bus side
              const inverterX = Math.min(BUS_X - 20, cx + NODE_W / 2 + 30);
              const breakerX = Math.min(BUS_X - 12, cx + NODE_W / 2 + 80);
              const lineFromNode = cx + NODE_W / 2;
              const showInverter = n.code !== 'DG' && inverterX - 9 > lineFromNode;
              return (
                <g key={n.id}>
                  {/* node → inverter */}
                  <line
                    x1={lineFromNode}
                    y1={cy}
                    x2={showInverter ? inverterX - 9 : breakerX - 6}
                    y2={cy}
                    stroke="var(--fg-2)"
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                  {showInverter && <Inverter x={inverterX} y={cy} stroke="var(--fg-2)" />}
                  {showInverter && (
                    <line
                      x1={inverterX + 9}
                      y1={cy}
                      x2={breakerX - 6}
                      y2={cy}
                      stroke="var(--fg-2)"
                      strokeWidth="1"
                      pointerEvents="none"
                    />
                  )}
                  <Breaker
                    x={breakerX}
                    y={cy}
                    open={!!breakers[n.id]}
                    stroke={off ? 'var(--fg-3)' : 'var(--fg-2)'}
                    interactive
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'TOGGLE_BREAKER', id: n.id });
                    }}
                  />
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
                    pointerEvents="none"
                  />
                  {/* Node */}
                  <g
                    onPointerDown={(e) => onNodePointerDown(e, n)}
                    onPointerMove={onNodePointerMove}
                    onPointerUp={onNodePointerUp}
                    style={{ cursor: tool === 'wire' ? 'crosshair' : tool === 'pan' ? 'grab' : 'move' }}
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
                    {wireFrom === n.id && (
                      <circle r={NODE_W / 2 + 8} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
                    )}
                  </g>
                  <FlowTag
                    x={(breakerX + BUS_X) / 2}
                    y={cy}
                    primary={n.flow.label.split(' · ')[0] ?? n.flow.label}
                    secondary={n.flow.label.split(' · ')[1] ?? ''}
                    color={off ? 'var(--fg-3)' : stroke}
                    variant={variant}
                    dim={pulseDim || off}
                  />
                  {(() => {
                    const isSel = n.id === selectedId;
                    const isKey = KEY_NODE_IDS.includes(n.id);
                    if (!isSel && !isKey) return null;
                    if (off) return null;
                    const chartMode: 'compact' | 'expanded' = isSel ? 'expanded' : 'compact';
                    const chartH = chartMode === 'expanded' ? 60 : 26;
                    return (
                      <InlineChart
                        cx={cx}
                        cy={cy + NODE_W / 2 + 28 + chartH / 2}
                        data={n.sparkline ?? DISPATCH_4H}
                        mode={chartMode}
                        tick={liveTick}
                      />
                    );
                  })()}
                </g>
              );
            })}

            {/* LOADS (right side) */}
            {loads.map((n) => {
              const off = !!breakers[n.id];
              const stroke = off ? 'var(--fg-3)' : flowColor;
              const cx = n.position.x;
              const cy = n.position.y;
              const breakerX = Math.max(BUS_X + 12, cx - NODE_W / 2 - 40);
              return (
                <g key={n.id}>
                  {/* bus → breaker */}
                  <line
                    x1={BUS_X + 4}
                    y1={cy}
                    x2={breakerX - 6}
                    y2={cy}
                    stroke={off ? 'var(--fg-3)' : stroke}
                    strokeWidth={off ? '1' : '1.6'}
                    strokeDasharray={off ? '2 4' : '4 6'}
                    opacity={off ? 0.45 : 1}
                    className={!off && !isInstrument ? 'ants' : ''}
                    markerEnd={off ? undefined : 'url(#arrow-ok)'}
                    pointerEvents="none"
                  />
                  <Breaker
                    x={breakerX}
                    y={cy}
                    open={off}
                    stroke={off ? 'var(--fg-3)' : 'var(--fg-2)'}
                    interactive
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'TOGGLE_BREAKER', id: n.id });
                    }}
                  />
                  {/* breaker → node */}
                  <line
                    x1={breakerX + 6}
                    y1={cy}
                    x2={cx - NODE_W / 2}
                    y2={cy}
                    stroke="var(--fg-2)"
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                  {/* Node */}
                  <g
                    onPointerDown={(e) => onNodePointerDown(e, n)}
                    onPointerMove={onNodePointerMove}
                    onPointerUp={onNodePointerUp}
                    style={{ cursor: tool === 'wire' ? 'crosshair' : tool === 'pan' ? 'grab' : 'move' }}
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
                    {wireFrom === n.id && (
                      <circle r={NODE_W / 2 + 8} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
                    )}
                  </g>
                  <FlowTag
                    x={(BUS_X + breakerX) / 2}
                    y={cy}
                    primary={n.flow.label}
                    secondary="LOAD"
                    color={off ? 'var(--fg-3)' : n.status === 'warn' ? 'var(--warn)' : stroke}
                    variant={variant}
                    dim={pulseDim || off}
                  />
                  {(() => {
                    const isSel = n.id === selectedId;
                    const isKey = KEY_NODE_IDS.includes(n.id);
                    if (!isSel && !isKey) return null;
                    if (off) return null;
                    const chartMode: 'compact' | 'expanded' = isSel ? 'expanded' : 'compact';
                    const chartH = chartMode === 'expanded' ? 60 : 26;
                    return (
                      <InlineChart
                        cx={cx}
                        cy={cy + NODE_W / 2 + 28 + chartH / 2}
                        data={n.sparkline ?? DISPATCH_4H}
                        mode={chartMode}
                        tick={liveTick}
                      />
                    );
                  })()}
                </g>
              );
            })}

            {/* CUSTOM WIRES (user-drawn) */}
            {wires.map((w) => {
              const a = nodes.find((n) => n.id === w.from);
              const b = nodes.find((n) => n.id === w.to);
              if (!a || !b) return null;
              const sel = w.id === selectedWireId;
              const midX = (a.position.x + b.position.x) / 2;
              const points = [
                [a.position.x, a.position.y],
                [midX, a.position.y],
                [midX, b.position.y],
                [b.position.x, b.position.y],
              ]
                .map((p) => p.join(','))
                .join(' ');
              return (
                <g key={w.id}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={sel ? 'var(--accent)' : 'var(--fg-2)'}
                    strokeWidth={sel ? 2 : 1.2}
                    strokeDasharray="3 4"
                    markerEnd="url(#arrow-accent)"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'SELECT_WIRE', id: w.id });
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}

            {/* MEASURE overlay */}
            {tool === 'measure' && measure.length >= 1 && (
              <g pointerEvents="none">
                {measure.length === 2 ? (
                  <>
                    <line
                      x1={measure[0].x}
                      y1={measure[0].y}
                      x2={measure[1].x}
                      y2={measure[1].y}
                      stroke="var(--accent)"
                      strokeDasharray="4 3"
                      strokeWidth="1.2"
                    />
                    {measure.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--accent)" />
                    ))}
                    <text
                      x={(measure[0].x + measure[1].x) / 2}
                      y={(measure[0].y + measure[1].y) / 2 - 8}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize="10"
                      fill="var(--accent)"
                    >
                      {Math.round(Math.hypot(measure[1].x - measure[0].x, measure[1].y - measure[0].y))} px
                    </text>
                  </>
                ) : (
                  <circle cx={measure[0].x} cy={measure[0].y} r={3} fill="var(--accent)" />
                )}
              </g>
            )}

            {/* Selection frame */}
            {selectedNode && (
              <SelectionFrame
                cx={selectedNode.position.x}
                cy={selectedNode.position.y}
                variant={variant}
              />
            )}
          </g>

          {/* Compute pulse banner */}
          {simulating && (
            <g pointerEvents="none">
              <rect
                x={VIEW_W / 2 - 80}
                y={VIEW_H / 2 - 16}
                width={160}
                height={32}
                fill="var(--panel)"
                stroke="var(--accent)"
                strokeWidth="1"
                rx={isInstrument ? 0 : 4}
                opacity={0.92}
              />
              <text
                x={VIEW_W / 2}
                y={VIEW_H / 2 + 4}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="11"
                letterSpacing="0.12em"
                fill="var(--accent)"
              >
                COMPUTING{'.'.repeat((pulseTick % 3) + 1)}
              </text>
            </g>
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
          <svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet">
            <rect
              x={BUS_X - 4}
              y={busTop}
              width="8"
              height={busBottom - busTop}
              fill="var(--accent)"
              opacity="0.55"
            />
            {nodes.map((n) => (
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
            {selectedNode && (
              <rect
                x={selectedNode.position.x - 22}
                y={selectedNode.position.y - 22}
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

      {/* Status footer info */}
      <div
        className="absolute bottom-3 left-3 z-10 font-mono text-[var(--fg-3)]"
        style={{ fontSize: 10, letterSpacing: '0.08em' }}
      >
        {nodes.length} ASSETS · {wires.length} CUSTOM WIRES
      </div>
    </div>
  );
}

export type { Asset };
