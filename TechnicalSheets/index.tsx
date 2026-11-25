import { useMemo, useState } from 'react';
import { FileDown, Info, FileText } from 'lucide-react';
import { useScenario } from '@/scenario';
import { computeCorridors } from '@/leastCostPath';
import { EDGES, NODE_BY_ID, EJE_BY_ID } from '@/corridors';
import { economicEstimates, environmentalBenefits, formatUF } from '@/leastCostPath';
import { useTechnicalSheetExport } from './export';

export function TechnicalSheetsPage() {
  const { scenario } = useScenario();
  const results = useMemo(
    () => computeCorridors(EDGES, scenario.origen, scenario.destino, scenario.weights),
    [scenario.origen, scenario.destino, scenario.weights]
  );
  const exportPdf = useTechnicalSheetExport();
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const optima = results.optima;

  if (!optima) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-8">
        <Info className="h-10 w-10 text-[#E7A44A]" />
        <p className="font-medium text-[#263238]">No existe un corredor calculado para el escenario actual</p>
        <p className="text-xs text-[#5b6a62]">Verifique la conexión entre origen y destino en el Diseñador de corredores.</p>
      </div>
    );
  }

  const eco = economicEstimates(optima);
  const amb = environmentalBenefits(optima);

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F5F7F5]">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-[#E7A44A]/10 border border-[#E7A44A]/40 text-[#7a5518] text-xs rounded px-3 py-2 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          La ficha técnica se genera a partir de datos simulados e incluye la advertencia “ESCENARIO DEMOSTRATIVO — DATOS SIMULADOS”.
        </div>

        <section className="bg-white rounded border border-[#dfe5e0] p-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#263238]">
                Corredor {NODE_BY_ID[scenario.origen]?.nombre} – {NODE_BY_ID[scenario.destino]?.nombre}
              </h2>
              <p className="text-xs text-[#5b6a62] mt-0.5">
                {scenario.comuna} · Eje: {EJE_BY_ID[scenario.eje].nombre}
                {generatedAt ? ` · Generado: ${generatedAt}` : ' · Vista previa'}
              </p>
            </div>
            <span className="text-[10px] bg-[#E7A44A]/15 text-[#a4712c] rounded px-2 py-1 uppercase tracking-wide font-medium">
              Escenario demostrativo — datos simulados
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-5 text-xs">
            <Block title="Características físicas" rows={[
              [`Longitud`, `${optima.lengthKm.toFixed(2)} km`],
              [`Ancho promedio`, `${optima.anchoProm.toFixed(1)} m`],
              [`Superficie`, `${eco.superficieM2.toLocaleString('es-CL')} m²`],
              [`Árboles / arbustos`, `${eco.arboles} / ${eco.arbustos}`],
            ]} />
            <Block title="Evaluación ambiental" rows={[
              ['Beneficio térmico', `hasta ${amb.beneficioTermico} °C`],
              ['Infiltración', `${amb.infiltracion} mm/h`],
              ['Escorrentía', `hasta ${amb.escorrentia} %`],
              ['Beneficio social', `${amb.beneficioSocial} pts`],
            ]} />
            <Block title="Evaluación económica" rows={[
              ['Implementación', formatUF(eco.costoImplementacionUF)],
              ['Mantención anual', formatUF(eco.costoMantAnualUF)],
            ]} />
          </div>

          <button
            onClick={() => {
              exportPdf(optima, results.alt1, results.alt2);
              setGeneratedAt(new Date().toLocaleString('es-CL'));
            }}
            className="mt-5 flex items-center gap-2 bg-[#174D38] hover:bg-[#0f3826] text-white rounded px-4 py-2.5 text-sm transition-colors"
          >
            <FileDown className="h-4 w-4" /> Descargar ficha técnica PDF
          </button>
        </section>

        <section className="bg-white rounded border border-[#dfe5e0] p-5 text-xs text-[#5b6a62] leading-relaxed">
          <h3 className="font-medium text-[#263238] text-sm mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#27865B]" /> Contenido de la ficha
          </h3>
          Identificación del corredor y fecha de generación; características físicas; evaluación ambiental y económica;
          justificación técnica con criterios y ponderaciones; comparación de alternativas; especies recomendadas por tramo;
          representación gráfica esquemática del trazado y sus nodos.
        </section>
      </div>
    </div>
  );
}

function Block({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded border border-[#dfe5e0] p-3">
      <div className="font-medium text-[#263238] mb-2">{title}</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between py-0.5">
          <span>{k}</span>
          <span className="font-medium text-[#263238] tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  );
}
