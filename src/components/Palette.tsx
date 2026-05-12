import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { PALETTE } from '@/data/assets';
import type { AssetKind } from '@/data/assets';

const DRAG_MIME = 'application/x-hydrel-asset';

export function Palette() {
  const { theme } = useTheme();
  const isInstrument = theme === 'instrument';
  const [q, setQ] = useState('');

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, code: AssetKind) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(DRAG_MIME, code);
    e.dataTransfer.setData('text/plain', code);
  };

  return (
    <aside
      className="border-r overflow-y-auto flex flex-col"
      style={{ width: 200, borderColor: 'var(--line)', background: 'var(--panel)' }}
    >
      <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--line)' }}>
        <div
          className="flex items-center gap-2 px-2.5 py-2 border"
          style={{
            borderColor: 'var(--line)',
            background: 'var(--sub)',
            borderRadius: isInstrument ? 2 : 6,
          }}
        >
          <Search size={12} strokeWidth={1.8} color="var(--fg-3)" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isInstrument ? '/ SEARCH' : 'Search'}
            className="flex-1 bg-transparent outline-none text-[var(--fg)]"
            style={{
              fontSize: isInstrument ? 11 : 12,
              fontFamily: isInstrument ? 'var(--font-mono)' : 'var(--font-sans)',
              letterSpacing: isInstrument ? '0.06em' : 0,
            }}
          />
        </div>
        <div
          className="font-mono uppercase text-[var(--fg-3)] mt-2 px-1"
          style={{ fontSize: 9, letterSpacing: '0.12em' }}
        >
          {isInstrument ? '↳ DRAG TO CANVAS' : 'Drag onto canvas →'}
        </div>
      </div>

      <div className="flex-1">
        {PALETTE.map((cat) => {
          const items = cat.items.filter(
            (it) => !q || it.label.toLowerCase().includes(q.toLowerCase()) || it.code.toLowerCase().includes(q.toLowerCase()),
          );
          if (items.length === 0 && q) return null;
          return (
            <div key={cat.name}>
              <div
                className="px-3 py-1.5 font-mono uppercase border-b"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--fg-3)',
                  background: 'var(--sub)',
                  borderColor: 'var(--line)',
                  borderTop: '1px solid var(--line)',
                }}
              >
                {cat.name}
              </div>
              {items.map((it) => {
                const highlight = !!it.highlight;
                if (isInstrument) {
                  return (
                    <div
                      key={it.code + it.label}
                      draggable
                      onDragStart={(e) => onDragStart(e, it.code)}
                      className="grid items-center border-b cursor-grab active:cursor-grabbing select-none hover:bg-[var(--sub)]"
                      style={{
                        gridTemplateColumns: '46px 1fr',
                        borderColor: 'var(--line)',
                        borderBottomStyle: 'dotted',
                        background: highlight ? 'var(--sub)' : 'transparent',
                        borderLeft: highlight ? '2px solid var(--accent)' : '2px solid transparent',
                      }}
                    >
                      <div
                        className="font-mono text-center py-2 border-r"
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.04em',
                          color: 'var(--fg)',
                          borderColor: 'var(--line)',
                        }}
                      >
                        {it.code}
                      </div>
                      <div
                        className="font-mono uppercase px-2.5 py-2"
                        style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--fg-2)' }}
                      >
                        {it.label}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={it.code + it.label}
                    draggable
                    onDragStart={(e) => onDragStart(e, it.code)}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-grab active:cursor-grabbing select-none hover:bg-[var(--sub)]"
                    style={{
                      background: highlight ? 'color-mix(in oklch, var(--accent) 12%, transparent)' : 'transparent',
                      borderLeft: highlight ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    <div
                      className="font-mono inline-flex items-center justify-center"
                      style={{
                        background: highlight ? 'var(--accent)' : 'var(--sub)',
                        color: highlight ? '#001520' : 'var(--fg)',
                        fontSize: 10,
                        letterSpacing: '0.04em',
                        padding: '3px 6px',
                        borderRadius: 4,
                        minWidth: 32,
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      {it.code}
                    </div>
                    <span className="text-[var(--fg-2)]" style={{ fontSize: 12 }}>
                      {it.label}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export const PALETTE_DRAG_MIME = DRAG_MIME;
