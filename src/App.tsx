import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatusFooter } from './components/StatusFooter';
import { PlantBuilder } from './screens/PlantBuilder';
import { SiteZones } from './screens/SiteZones';
import { LiveOperations } from './screens/LiveOperations';
import { ProjectEconomics } from './screens/ProjectEconomics';
import { CostOfWaiting } from './screens/CostOfWaiting';
import { BuilderProvider } from './lib/builder-store';

export type Screen = 'plant' | 'zones' | 'ops' | 'econ' | 'cow';

export default function App() {
  const [screen, setScreen] = useState<Screen>('plant');
  const showFooter = screen === 'plant' || screen === 'ops' || screen === 'zones';

  return (
    <BuilderProvider>
      <div className="flex flex-col h-full" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <Header />
        <div className="flex flex-1 min-h-0">
          <Sidebar current={screen} onSelect={setScreen} />
          <main className="flex-1 min-w-0 overflow-hidden" style={{ background: 'var(--bg)' }}>
            {screen === 'plant' && <PlantBuilder />}
            {screen === 'zones' && <SiteZones onDrillDown={() => setScreen('plant')} />}
            {screen === 'ops' && <LiveOperations />}
            {screen === 'econ' && <ProjectEconomics />}
            {screen === 'cow' && <CostOfWaiting />}
          </main>
        </div>
        {showFooter && <StatusFooter />}
      </div>
    </BuilderProvider>
  );
}
