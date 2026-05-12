import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { Asset, AssetKind } from '@/data/assets';
import {
  BASELINE,
  scenarioByKey,
  type BreakerState,
  type Scenario,
  type Wire,
} from './scenarios';
import {
  clampToCanvas,
  clampUtility,
  defaultSideForKind,
  formatMW,
  makeAsset,
  nextNodeId,
  snapToGrid,
} from './sld-layout';
import { simulate } from './simulate';

export type Tool = 'select' | 'pan' | 'wire' | 'measure';

export interface MeasurePoint {
  x: number;
  y: number;
}

export interface BuilderState {
  scenarioKey: Scenario['key'];
  nodes: Asset[];
  wires: Wire[];
  breakers: BreakerState;
  selectedId: string | null;
  selectedWireId: string | null;
  selectedZoneId: string | null;
  tool: Tool;
  wireFrom: string | null;
  measure: MeasurePoint[]; // 0, 1, or 2 points
  pan: { x: number; y: number };
  simulating: boolean;
  editingId: string | null;
  pulseUntil: number; // timestamp ms; if > now, fade flow values
}

export type BuilderAction =
  | { type: 'SELECT'; id: string | null }
  | { type: 'SELECT_WIRE'; id: string | null }
  | { type: 'SELECT_ZONE'; id: string | null }
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'MOVE_NODE'; id: string; position: { x: number; y: number } }
  | { type: 'ADD_NODE'; code: AssetKind; position: { x: number; y: number } }
  | { type: 'DELETE_NODE'; id: string }
  | { type: 'ADD_WIRE'; from: string; to: string }
  | { type: 'DELETE_WIRE'; id: string }
  | { type: 'WIRE_FROM'; id: string | null }
  | { type: 'TOGGLE_BREAKER'; id: string }
  | { type: 'UPDATE_NAME'; id: string; name: string }
  | { type: 'UPDATE_TAG'; id: string; key: string; value: string }
  | { type: 'UPDATE_READOUT'; id: string; label: string; value: string }
  | { type: 'UPDATE_FLOW'; id: string; value: number }
  | { type: 'SET_SOC'; id: string; value: number }
  | { type: 'LOAD_SCENARIO'; key: Scenario['key'] }
  | { type: 'RECOMPUTE' }
  | { type: 'SET_SIMULATING'; on: boolean; pulseUntil?: number }
  | { type: 'SET_EDITING'; id: string | null }
  | { type: 'MEASURE_POINT'; point: MeasurePoint }
  | { type: 'MEASURE_RESET' }
  | { type: 'PAN_DELTA'; dx: number; dy: number }
  | { type: 'PAN_SET'; x: number; y: number }
  | { type: 'PAN_RESET' }
  | { type: 'HYDRATE'; state: Partial<BuilderState> };

const STORAGE_KEY = 'hydrel:builder:v2';

function fromScenario(s: Scenario): BuilderState {
  const initialId = s.nodes.find((n) => n.id === 'BESS-01')?.id ?? s.nodes[0]?.id ?? null;
  return {
    scenarioKey: s.key,
    nodes: s.nodes,
    wires: s.wires,
    breakers: s.breakers,
    selectedId: initialId,
    selectedWireId: null,
    selectedZoneId: 'Z-FUEL-CELL',
    tool: 'select',
    wireFrom: null,
    measure: [],
    pan: { x: 0, y: 0 },
    simulating: false,
    editingId: null,
    pulseUntil: 0,
  };
}

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedId: action.id, selectedWireId: null };
    case 'SELECT_WIRE':
      return { ...state, selectedWireId: action.id, selectedId: null };
    case 'SELECT_ZONE':
      return { ...state, selectedZoneId: action.id };
    case 'SET_TOOL':
      return { ...state, tool: action.tool, wireFrom: null, measure: [] };
    case 'MOVE_NODE': {
      const target = state.nodes.find((n) => n.id === action.id);
      // Utility uses a tighter clamp so it always stays above the bus
      const pos = target?.side === 'utility'
        ? clampUtility(action.position)
        : clampToCanvas(action.position);
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.id ? { ...n, position: pos } : n,
        ),
      };
    }
    case 'ADD_NODE': {
      const ids = state.nodes.map((n) => n.id);
      const { id, name } = nextNodeId(ids, action.code);
      const pos = clampToCanvas(snapToGrid(action.position));
      const node = makeAsset(id, name, action.code, pos);
      const next = simulate([...state.nodes, node], state.breakers);
      return { ...state, nodes: next, selectedId: id };
    }
    case 'DELETE_NODE': {
      if (state.nodes.length <= 1) return state;
      const nodes = state.nodes.filter((n) => n.id !== action.id);
      const wires = state.wires.filter((w) => w.from !== action.id && w.to !== action.id);
      const breakers = { ...state.breakers };
      delete breakers[action.id];
      const next = simulate(nodes, breakers);
      return {
        ...state,
        nodes: next,
        wires,
        breakers,
        selectedId: state.selectedId === action.id ? next[0]?.id ?? null : state.selectedId,
      };
    }
    case 'ADD_WIRE': {
      if (action.from === action.to) return state;
      const exists = state.wires.some(
        (w) =>
          (w.from === action.from && w.to === action.to) ||
          (w.from === action.to && w.to === action.from),
      );
      if (exists) return { ...state, wireFrom: null };
      const w: Wire = {
        id: `W-${Date.now().toString(36)}`,
        from: action.from,
        to: action.to,
        custom: true,
      };
      return { ...state, wires: [...state.wires, w], wireFrom: null };
    }
    case 'DELETE_WIRE':
      return {
        ...state,
        wires: state.wires.filter((w) => w.id !== action.id),
        selectedWireId: state.selectedWireId === action.id ? null : state.selectedWireId,
      };
    case 'WIRE_FROM':
      return { ...state, wireFrom: action.id };
    case 'TOGGLE_BREAKER': {
      const breakers = { ...state.breakers, [action.id]: !state.breakers[action.id] };
      const next = simulate(state.nodes, breakers);
      return { ...state, breakers, nodes: next };
    }
    case 'UPDATE_NAME':
      return {
        ...state,
        nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, name: action.name } : n)),
      };
    case 'UPDATE_TAG':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.id
            ? {
                ...n,
                tags: n.tags.map((t) =>
                  t.key === action.key ? { ...t, value: action.value } : t,
                ),
              }
            : n,
        ),
      };
    case 'UPDATE_READOUT': {
      let nodes = state.nodes.map((n) =>
        n.id === action.id
          ? {
              ...n,
              readouts: n.readouts.map((r) =>
                r.label === action.label ? { ...r, value: action.value } : r,
              ),
            }
          : n,
      );
      // If POWER readout changed, also update flow.value (best-effort parse)
      if (action.label.toUpperCase() === 'POWER') {
        const m = action.value.match(/-?\+?[\d.]+/);
        if (m) {
          const v = parseFloat(action.value.replace('−', '-'));
          if (!Number.isNaN(v)) {
            nodes = nodes.map((n) =>
              n.id === action.id
                ? {
                    ...n,
                    flow: {
                      ...n.flow,
                      value: v,
                      label: rebuildFlowLabel(n, v),
                    },
                  }
                : n,
            );
          }
        }
      }
      const balanced = simulate(nodes, state.breakers);
      return { ...state, nodes: balanced };
    }
    case 'UPDATE_FLOW': {
      const nodes = state.nodes.map((n) =>
        n.id === action.id
          ? {
              ...n,
              flow: { ...n.flow, value: action.value, label: rebuildFlowLabel(n, action.value) },
              readouts: n.readouts.map((r) =>
                r.label.toUpperCase() === 'POWER'
                  ? { ...r, value: formatMW(action.value, n.flow.signed) }
                  : r,
              ),
            }
          : n,
      );
      const balanced = simulate(nodes, state.breakers);
      return { ...state, nodes: balanced };
    }
    case 'SET_SOC': {
      const v = Math.max(0, Math.min(100, action.value));
      const nodes = state.nodes.map((n) => {
        if (n.id !== action.id || !n.soc) return n;
        // Map SOC change → small dispatch change for plausibility:
        // the operator is steering the BESS toward the new SOC.
        const dispatch = +(((v - 50) * 0.04)).toFixed(2);
        return {
          ...n,
          soc: { ...n.soc, value: v },
          flow: { ...n.flow, value: dispatch, label: rebuildFlowLabel(n, dispatch) },
          readouts: n.readouts.map((r) => {
            const label = r.label.toUpperCase();
            if (label === 'SOC') return { ...r, value: `${v.toFixed(1)}%` };
            if (label === 'POWER') return { ...r, value: formatMW(dispatch, true) };
            return r;
          }),
        };
      });
      const balanced = simulate(nodes, state.breakers);
      return { ...state, nodes: balanced };
    }
    case 'LOAD_SCENARIO': {
      const s = scenarioByKey(action.key);
      return { ...fromScenario(s) };
    }
    case 'RECOMPUTE': {
      const next = simulate(state.nodes, state.breakers);
      return { ...state, nodes: next };
    }
    case 'SET_SIMULATING':
      return {
        ...state,
        simulating: action.on,
        pulseUntil: action.on ? action.pulseUntil ?? Date.now() + 1500 : 0,
      };
    case 'SET_EDITING':
      return { ...state, editingId: action.id };
    case 'MEASURE_POINT': {
      if (state.measure.length >= 2) return { ...state, measure: [action.point] };
      return { ...state, measure: [...state.measure, action.point] };
    }
    case 'MEASURE_RESET':
      return { ...state, measure: [] };
    case 'PAN_DELTA':
      return { ...state, pan: { x: state.pan.x + action.dx, y: state.pan.y + action.dy } };
    case 'PAN_SET':
      return { ...state, pan: { x: action.x, y: action.y } };
    case 'PAN_RESET':
      return { ...state, pan: { x: 0, y: 0 } };
    case 'HYDRATE':
      return { ...state, ...action.state } as BuilderState;
    default:
      return state;
  }
}

function rebuildFlowLabel(asset: Asset, v: number): string {
  if (asset.code === 'BAT') {
    if (v > 0.005) return `${formatMW(v, true)} · DISCH`;
    if (v < -0.005) return `${formatMW(v, true)} · CHRG`;
    return `${formatMW(v, true)} · IDLE`;
  }
  if (asset.side === 'source') {
    if (v < 0.005) return `0.00 MW · STBY`;
    return `${formatMW(v)} · GEN`;
  }
  if (asset.side === 'utility') {
    if (v > 0.005) return `${formatMW(v)} · IMPORT`;
    if (v < -0.005) return `${formatMW(Math.abs(v))} · EXPORT`;
    return `0.00 MW · BAL`;
  }
  return formatMW(v);
}

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
} | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => fromScenario(BASELINE),
  );

  // Hydrate from localStorage on first client render (after mount, since reducer init runs in SSR-safe lazy form)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<BuilderState>;
      if (parsed && parsed.nodes && parsed.nodes.length > 0) {
        dispatch({ type: 'HYDRATE', state: parsed });
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist on every change (after initial hydrate)
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      // Don't persist transient UI state
      const { simulating: _s, pulseUntil: _p, wireFrom: _w, measure: _m, ...persist } = state;
      void _s;
      void _p;
      void _w;
      void _m;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
}

export function useBuilderState(): BuilderState {
  return useBuilder().state;
}

export function useBuilderDispatch(): Dispatch<BuilderAction> {
  return useBuilder().dispatch;
}

// Helper for code calling SELECTED asset
export function selectedAsset(state: BuilderState): Asset | null {
  if (!state.selectedId) return state.nodes[0] ?? null;
  return state.nodes.find((n) => n.id === state.selectedId) ?? state.nodes[0] ?? null;
}

export function defaultDropSide(code: AssetKind): 'source' | 'load' | 'utility' {
  return defaultSideForKind(code);
}

export const STORAGE_KEY_EXPORT = STORAGE_KEY;
