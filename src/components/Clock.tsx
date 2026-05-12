import { useEffect, useState } from 'react';

function fmt(d: Date, withMs: boolean) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  if (!withMs) return `${hh}:${mm}:${ss} PDT`;
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms} PDT`;
}

export function Clock({ withMs = false }: { withMs?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), withMs ? 200 : 1000);
    return () => window.clearInterval(id);
  }, [withMs]);
  return <span className="font-mono tabular-nums">{fmt(now, withMs)}</span>;
}
