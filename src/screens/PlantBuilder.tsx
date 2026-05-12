import { useState } from 'react';
import { Palette } from '@/components/Palette';
import { SldCanvas } from '@/components/SldCanvas';
import { Inspector } from '@/components/Inspector';
import { ALL_ASSETS } from '@/data/assets';

export function PlantBuilder() {
  const [selectedId, setSelectedId] = useState('BESS-01');
  const selected = ALL_ASSETS.find((a) => a.id === selectedId) ?? ALL_ASSETS[0];

  return (
    <div className="h-full flex min-h-0 overflow-hidden">
      <Palette />
      <SldCanvas selectedId={selectedId} onSelect={setSelectedId} />
      <Inspector asset={selected} />
    </div>
  );
}
