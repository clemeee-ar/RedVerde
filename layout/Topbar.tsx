import { CircleDot, FileDown, Sparkles, AlertTriangle } from 'lucide-react';
import { useScenario } from '@/scenario';
import { NODE_BY_ID } from '@/corridors';
import { EJE_BY_ID } from '@/corridors';
import { Button } from '../ui/button';

interface Props {
  onGenerate: () => void;
  onExport: () => void;
}

export function Topbar({ onGenerate, onExport }: Props) {
  const { scenario, activeModule } = useScenario();
  const origen = NODE_BY_ID[scenario.origen];
  const destino = NODE_BY_ID[scenario.destino];

  const titles: Record<string, string> = {
    designer: 'Diseñador de corredores',
    analysis: 'Análisis territorial',
    biodiversity: 'Biodiversidad y especies',
    results: 'Resultados y evaluación',
    uploads: 'Carga de datos',
    sheets: 'Fichas técnicas',
  };

  return (
    <header className="h-16 bg-white border-b border-[#dfe5e0] flex items-center px-6 gap-4 justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="font-semibold text-[#263238] text-lg truncate">{titles[activeModule] ?? 'Corredor Vivo Santiago'}</h1>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-[#F5F7F5] text-[#397D91] border border-[#dfe5e0] rounded px-2 py-0.5 whitespace-nowrap">
          <CircleDot className="h-3 w-3" /> {origen?.comuna} → {destino?.comuna}
        </span>
        <span className="hidden lg:inline text-[11px] text-[#7a8880] truncate whitespace-nowrap">
          Eje: {EJE_BY_ID[scenario.eje].nombre} · Última configuración: origen {origen?.nombre}, destino {destino?.nombre}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-medium bg-[#E7A44A]/15 text-[#a4712c] rounded px-2 py-1 uppercase tracking-wide">
          <AlertTriangle className="h-3 w-3" /> Escenario demostrativo — datos simulados
        </span>
        <Button onClick={onGenerate} className="bg-[#27865B] hover:bg-[#1e6b48] text-white gap-2">
          <Sparkles className="h-4 w-4" /> Generar corredor
        </Button>
        <Button onClick={onExport} variant="outline" className="border-[#dfe5e0] text-[#263238] gap-2 hover:bg-[#F5F7F5]">
          <FileDown className="h-4 w-4" /> Exportar resultados
        </Button>
      </div>
    </header>
  );
}
