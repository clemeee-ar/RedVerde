import { useEffect, useMemo, useState } from 'react';
import { Layers, Map as MapIcon } from 'lucide-react';
import { EDGES } from '@/corridors';
import { CorridorMap, DEFAULT_LAYERS, type MapLayers } from '@/map/CorridorMap';
import { ConfigPanel } from '@/corridor/ConfigPanel';
import { ResultsPanel } from '@/corridor/ResultsPanel';
import { SegmentDialog } from '@/corridor/SegmentDialog';
import { useScenario } from '@/scenario';
import { computeCorridors } from '@/leastCostPath';
import type { CorridorResult, SegmentResult } from '@/index';
import { Button } from '@/ui/button';
import { cn } from '@/utils';

const LAYER_DEFS: { id: keyof MapLayers; label: string; grupo: string }[] = [
  { id: 'areasVerdes', label: 'Áreas verdes existentes', grupo: 'Base' },
  { id: 'nodos', label: 'Nodos ecológicos', grupo: 'Base' },
  { id: 'ejes', label: 'Ejes viales', grupo: 'Base' },
  { id: 'corredores', label: 'Corredores potenciales', grupo: 'Base' },
  { id: 'temperatura', label: 'Temperatura superficial', grupo: 'Ambiental (simulada)' },
  { id: 'riesgoHidrico', label: 'Riesgo hídrico', grupo: 'Ambiental (simulada)' },
  { id: 'vegetacion', label: 'Cobertura vegetal', grupo: 'Ambiental (simulada)' },
  { id: 'densidad', label: 'Densidad poblacional', grupo: 'Social (simulada)' },
  { id: 'vulnerabilidad', label: 'Vulnerabilidad social', grupo: 'Social (simulada)' },
  { id: 'acceso', label: 'Acceso a áreas verdes', grupo: 'Social (simulada)' },
];

export function DesignerPage({ onExport }: { onExport: () => void }) {
  const { scenario, update } = useScenario();
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  const [showLayers, setShowLayers] = useState(false);
  const [corridors, setCorridors] = useState<{ optima: CorridorResult | null; alt1: CorridorResult | null; alt2: CorridorResult | null }>({ optima: null, alt1: null, alt2: null });
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentResult | null>(null);
  const [fitKey, setFitKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGenerate = () => {
    const result = computeCorridors(EDGES, scenario.origen, scenario.destino, scenario.weights);
    setCorridors(result);
    setSelectedRoute(result.optima ? 'optima' : null);
    update({ generated: true, lastRunId: Date.now() });
    setFitKey((k) => k + 1);
  };

  // Recalcula cuando la barra superior dispara una nueva corrida.
  useEffect(() => {
    if (!scenario.lastRunId) return;
    const result = computeCorridors(EDGES, scenario.origen, scenario.destino, scenario.weights);
    setCorridors(result);
    setSelectedRoute(result.optima ? 'optima' : null);
    setFitKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.lastRunId]);

  const handleSelectSegment = (seg: SegmentResult) => {
    setSelectedSegment(seg);
    setDialogOpen(true);
  };

  const grupos = useMemo(() => {
    const g: Record<string, typeof LAYER_DEFS> = {};
    for (const l of LAYER_DEFS) (g[l.grupo] ??= []).push(l);
    return g;
  }, []);

  return (
    <div className="flex h-full relative">
      {/* A: Configuración */}
      <div className="w-[290px] shrink-0 border-r border-[#dfe5e0] bg-white">
        <ConfigPanel onGenerate={handleGenerate} />
      </div>

      {/* B: Mapa */}
      <div className="flex-1 relative min-w-0">
        <CorridorMap
          layers={layers}
          corridors={corridors}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
          onSelectSegment={handleSelectSegment}
          origen={scenario.origen}
          destino={scenario.destino}
          fitKey={fitKey}
        />
        {/* Selector de capas */}
        <div className="absolute top-3 left-3 z-[1000]">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/95 shadow border-[#dfe5e0] gap-2"
            onClick={() => setShowLayers((s) => !s)}
          >
            <Layers className="h-4 w-4 text-[#27865B]" /> Capas
          </Button>
          {showLayers && (
            <div className="mt-2 bg-white/97 rounded-lg shadow-lg border border-[#dfe5e0] p-3 w-64 max-h-[70vh] overflow-y-auto">
              {Object.entries(grupos).map(([grupo, defs]) => (
                <div key={grupo} className="mb-2 last:mb-0">
                  <div className="text-[10px] uppercase tracking-wider text-[#8a968e] font-medium mb-1">{grupo}</div>
                  {defs.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 py-0.5 cursor-pointer text-xs text-[#263238] hover:bg-[#F5F7F5] rounded px-1">
                      <input
                        type="checkbox"
                        checked={layers[d.id]}
                        onChange={(e) => setLayers((l) => ({ ...l, [d.id]: e.target.checked }))}
                        className="accent-[#27865B]"
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              ))}
              <p className="text-[9px] text-[#8a968e] mt-2 leading-snug border-t border-[#e6ebe7] pt-2">
                Capas ambientales y sociales con geometrías demostrativas simuladas; no constituyen levantamientos cartográficos reales.
              </p>
            </div>
          )}
        </div>
        {/* Etiqueta demostrativa */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#E7A44A]/90 text-white text-[10px] font-medium rounded px-2 py-1 uppercase tracking-wide">
          Escenario demostrativo — datos simulados
        </div>
        {corridors.optima && (
          <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 border border-[#dfe5e0] rounded px-3 py-2 text-[11px] text-[#263238] shadow flex items-center gap-2">
            <MapIcon className="h-3.5 w-3.5 text-[#27865B]" />
            Rutas: verde = recomendada · azul = alternativa 1 · naranja = alternativa 2
          </div>
        )}
      </div>

      {/* C: Resultados */}
      <div className="w-[340px] shrink-0 border-l border-[#dfe5e0] bg-[#fafbfa]">
        <ResultsPanel
          optima={corridors.optima}
          alt1={corridors.alt1}
          alt2={corridors.alt2}
          weights={scenario.weights}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
          onExport={onExport}
        />
      </div>

      <SegmentDialog segment={selectedSegment} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
