import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'helios' | 'instrument';
export type Mode = 'dark' | 'light';

export interface ThemeState {
  theme: Theme;
  mode: Mode;
}

export function readTheme(): ThemeState {
  if (typeof window === 'undefined') return { theme: 'helios', mode: 'dark' };
  const p = new URLSearchParams(window.location.search);
  const theme: Theme = p.get('theme') === 'instrument' ? 'instrument' : 'helios';
  const defaultMode: Mode = theme === 'helios' ? 'dark' : 'light';
  const modeParam = p.get('mode');
  const mode: Mode = modeParam === 'dark' || modeParam === 'light' ? modeParam : defaultMode;
  return { theme, mode };
}

const ThemeContext = createContext<ThemeState>({ theme: 'helios', mode: 'dark' });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => readTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-mode', state.mode);
  }, [state.theme, state.mode]);

  useEffect(() => {
    const onPop = () => setState(readTheme());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const value = useMemo(() => state, [state]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  return useContext(ThemeContext);
}
