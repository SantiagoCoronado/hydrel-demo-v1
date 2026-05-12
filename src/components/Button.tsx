import type { ButtonHTMLAttributes } from 'react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

export function Button({ variant = 'primary', full, className, children, ...rest }: Props) {
  const { theme, mode } = useTheme();
  const isInstrument = theme === 'instrument';

  const base = cn(
    'inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150 select-none whitespace-nowrap',
    full && 'w-full',
    isInstrument
      ? 'font-mono uppercase tracking-[0.06em] text-[12px] px-3 py-[7px]'
      : 'text-[13px] font-medium px-3.5 py-2.5',
    isInstrument ? 'rounded-[2px]' : 'rounded-md',
  );

  if (variant === 'primary') {
    return (
      <button
        {...rest}
        className={cn(base, className)}
        style={{
          background: isInstrument ? 'var(--fg)' : 'var(--accent)',
          color: isInstrument
            ? 'var(--bg)'
            : mode === 'dark'
              ? '#001520'
              : '#fff',
          boxShadow: !isInstrument && mode === 'dark' ? '0 0 18px color-mix(in oklch, var(--accent) 35%, transparent)' : 'none',
          fontWeight: isInstrument ? 500 : 600,
        }}
      >
        {children}
      </button>
    );
  }
  if (variant === 'secondary') {
    return (
      <button
        {...rest}
        className={cn(base, 'border', className)}
        style={{
          background: 'var(--panel)',
          color: 'var(--fg)',
          borderColor: 'var(--line)',
          fontWeight: isInstrument ? 500 : 600,
        }}
      >
        {children}
      </button>
    );
  }
  if (variant === 'danger') {
    return (
      <button
        {...rest}
        className={cn(base, 'border', className)}
        style={{
          background: 'var(--panel)',
          color: 'var(--err)',
          borderColor: isInstrument ? 'var(--err)' : 'var(--line)',
          fontWeight: isInstrument ? 500 : 600,
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      {...rest}
      className={cn(base, className)}
      style={{
        background: 'transparent',
        color: 'var(--fg-2)',
        fontWeight: isInstrument ? 500 : 600,
      }}
    >
      {children}
    </button>
  );
}
