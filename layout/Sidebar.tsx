import { useMemo, useState } from 'react';
import {
  LayoutGrid, Sprout, LineChart, FileBarChart2, FolderUp, Leaf, RotateCcw, MapPin, Database, FlaskConical, Download,
} from 'lucide-react';
import { cn } from '@/utils';
import { useScenario } from '@/scenario';

const MODULES = [
  { id: 'designer', label: 'Diseñador de corredores', icon: LayoutGrid },
  { id: 'analysis', label: 'Análisis territorial', icon: LineChart },
  { id: 'biodiversity', label: 'Biodiversidad y especies', icon: Sprout },
  { id: 'results', label: 'Resultados y evaluación', icon: FileBarChart2 },
  { id: 'uploads', label: 'Carga de datos', icon: FolderUp },
  { id: 'sheets', label: 'Fichas técnicas', icon: Download },
];

export function Sidebar() {
  const { activeModule, setActiveModule, scenario, reset } = useScenario();
  return (
    <aside className="w-64 shrink-0 bg-[#174D38] text-white flex flex-col">
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-[#B8DCC5]" />
          <div>
            <div className="font-semibold tracking-wide text-[15px] leading-tight">CORREDOR VIVO</div>
            <div className="text-[#B8DCC5] text-xs tracking-[0.2em]">SANTIAGO</div>
          </div>
        </div>
        <p className="text-[11px] text-white/60 mt-3 leading-snug">
          Plataforma de planificación y optimización de infraestructura verde urbana
        </p>
      </div>

      <nav className="flex-1 py-4">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={cn(
              'w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left',
              activeModule === m.id ? 'bg-white/10 font-medium text-white border-l-2 border-[#B8DCC5]' : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <m.icon className="h-4 w-4 shrink-0" />
            {m.label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 space-y-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-wide text-[10px] mb-1">
            <MapPin className="h-3 w-3" /> Escenario activo
          </div>
          <div className="text-white/90">{scenario.sector}</div>
          <div className="text-white/50">{scenario.comuna}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-wide text-[10px] mb-1">
            <Database className="h-3 w-3" /> Datos
          </div>
          <span className="inline-flex items-center gap-1 bg-[#E7A44A]/20 text-[#E7A44A] rounded px-1.5 py-0.5">
            <FlaskConical className="h-3 w-3" /> Simulados
          </span>
          {scenario.uploads.length > 0 && (
            <span className="ml-1 inline-flex bg-[#27865B]/25 text-[#B8DCC5] rounded px-1.5 py-0.5">
              {scenario.uploads.length} archivo(s)
            </span>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Restablecer escenario
        </button>
        <div className="text-[10px] text-white/35 pt-2 border-t border-white/10">
          Prototipo de innovación territorial | Región Metropolitana
        </div>
      </div>
    </aside>
  );
}
