import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'helios' | 'instrument';
export type Mode = 'dark' | 'light';

export interface ThemeState {
  theme: Theme;
  mode: Mode;
}

interface ThemeControls {
  setMode: (m: Mode) => void;
  setTheme: (t: Theme) => void;
  toggleMode: () => void;
}

const MODE_STORAGE_KEY = 'hydrel:theme:mode';
const THEME_STORAGE_KEY = 'hydrel:theme:name';

function readUrlMode(): Mode | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  const m = p.get('mode');
  return m === 'dark' || m === 'light' ? (m as Mode) : null;
}

function readUrlTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  const t = p.get('theme');
  return t === 'helios' || t === 'instrument' ? (t as Theme) : null;
}

function readStorageMode(): Mode | null {
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY);
    return v === 'dark' || v === 'light' ? (v as Mode) : null;
  } catch {
    return null;
  }
}

function readStorageTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'helios' || v === 'instrument' ? (v as Theme) : null;
  } catch {
    return null;
  }
}

export function readTheme(): ThemeState {
  if (typeof window === 'undefined') return { theme: 'helios', mode: 'dark' };
  const theme: Theme = readUrlTheme() ?? readStorageTheme() ?? 'helios';
  const defaultMode: Mode = theme === 'helios' ? 'dark' : 'light';
  // URL > localStorage > theme default
  const mode: Mode = readUrlMode() ?? readStorageMode() ?? defaultMode;
  return { theme, mode };
}

const ThemeContext = createContext<ThemeState>({ theme: 'helios', mode: 'dark' });
const ThemeControlsContext = createContext<ThemeControls>({
  setMode: () => {},
  setTheme: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => readTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-mode', state.mode);
  }, [state.theme, state.mode]);

  // On first mount, sync URL preference into localStorage so the next URL-less visit stays consistent
  useEffect(() => {
    const urlMode = readUrlMode();
    const urlTheme = readUrlTheme();
    try {
      if (urlMode) localStorage.setItem(MODE_STORAGE_KEY, urlMode);
      if (urlTheme) localStorage.setItem(THEME_STORAGE_KEY, urlTheme);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onPop = () => setState(readTheme());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setState((s) => ({ ...s, mode: m }));
    try {
      localStorage.setItem(MODE_STORAGE_KEY, m);
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setState((s) => ({ ...s, theme: t }));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // ignore
    }
  }, []);

  const toggleMode = useCallback(() => {
    setState((s) => {
      const next: Mode = s.mode === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return { ...s, mode: next };
    });
  }, []);

  const stateValue = useMemo(() => state, [state]);
  const controls = useMemo<ThemeControls>(() => ({ setMode, setTheme, toggleMode }), [setMode, setTheme, toggleMode]);

  return (
    <ThemeContext.Provider value={stateValue}>
      <ThemeControlsContext.Provider value={controls}>{children}</ThemeControlsContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeState {
  return useContext(ThemeContext);
}

export function useThemeControls(): ThemeControls {
  return useContext(ThemeControlsContext);
}
