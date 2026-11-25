import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { EjeId, UploadedDataset, Weights } from '../types';
import { DEFAULT_WEIGHTS } from '../data/criteria';

export interface Scenario {
  comuna: string;
  sector: string;
  eje: EjeId;
  origen: string;
  destino: string;
  weights: Weights;
  generated: boolean;
  lastRunId?: number;
  uploads: UploadedDataset[];
}

export const INITIAL_SCENARIO: Scenario = {
  comuna: 'Ñuñoa / La Florida',
  sector: 'Corredor Vicuña Mackenna Sur',
  eje: 'vm',
  origen: 'parque_san_borja',
  destino: 'la_florida',
  weights: { ...DEFAULT_WEIGHTS },
  generated: false,
  uploads: [],
};

interface Ctx {
  scenario: Scenario;
  update: (patch: Partial<Scenario>) => void;
  reset: () => void;
  activeModule: string;
  setActiveModule: (id: string) => void;
}

const ScenarioContext = createContext<Ctx | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<Scenario>(INITIAL_SCENARIO);
  const [activeModule, setActiveModule] = useState<string>('designer');

  const update = (patch: Partial<Scenario>) => setScenario((s) => ({ ...s, ...patch }));
  const reset = () => setScenario({ ...INITIAL_SCENARIO, weights: { ...DEFAULT_WEIGHTS } });

  const value = useMemo(() => ({ scenario, update, reset, activeModule, setActiveModule }), [scenario, activeModule]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useScenario fuera de ScenarioProvider');
  return ctx;
}
