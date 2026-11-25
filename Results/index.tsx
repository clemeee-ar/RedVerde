import { useMemo } from 'react';
import { BarChart3, GitCompare, Info, Leaf, ShieldAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts';
import { useScenario } from '../../state/scenario';
import { computeCorridors } from '../../algorithms/leastCostPath';
import { compareRoutes, explainSelection, type CorridorLike } from '../../algorithms/indicators/comparison';
import { EDGES } from '../../data/corridors';
import type { CorridorResult } from '../../types';

export function ResultsPage() {
  const { scenario } = useScenario();
  const results = useMemo(
    () => computeCorridors(EDGES, scenario.origen, scenario.destino, scenario.weights),
    [scenario.origen, scenario.destino, scenario.weights]
  );
  const { optima, alt1, alt2 } = results;

  const comparisons = compareRoutes([
    optima ? { ...optima, weights: scenario.weights } : null,
    alt1 ? { ...alt1, weights: scenario.weights } : null,
    alt2 ? { ...alt2, weights: scenario.weights } : null,
  ]);

  const compData = useMemo(() => {
    if (comparisons.length === 0) return [];
    const criterios = comparisons[0].aportes.map((a) => a.id);
    return criterios.map((cid) => {
      const row: Record<string, string | number> = { criterio: cid };
      for (const c of comparisons) {
        row[c.etiqueta] = Math.round((c.aportes.find((a) => a.id === cid)?.aporte ?? 0) * 100) / 100;
      }
      return row;
    });
  }, [comparisons]);

  if (!optima) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-8">
        <ShieldAlert className="h-10 w-10 text-[#E7A44A]" />
        <p className="font-medium text-[#263238]">No existe ruta calculada para el escenario actual</p>
        <p className="text-xs text-[#5b6a62]">Verifica que el origen y destino estén conectados en la red de demostración.</p>
      </div>
    );
  }

  const COLORS = [optima.color, alt1?.color ?? '#8a968e', alt2?.color ?? '#c4ccc7'];
  const legendNames = [optima.etiqueta, alt1?.etiqueta, alt2?.etiqueta].filter(Boolean) as string[];

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F5F7F5]">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="bg-[#E7A44A]/10 border border-[#E7A44A]/40 text-[#7a5518] text-xs rounded px-3 py-2 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Evaluación basada en el modelo demostrativo de menor costo ponderado con datos simulados. Los valores no constituyen mediciones reales.
        </div>

        {/* Comparación de rutas */}
        <section className="bg-white rounded border border-[#dfe5e0] p-4">
          <h3 className="font-medium text-[#263238] flex items-center gap-2 text-sm">
            <GitCompare className="h-4 w-4 text-[#27865B]" /> Comparación de rutas alternativas
          </h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compData} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe7" />
                <XAxis dataKey="criterio" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <ReTooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {legendNames.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={COLORS[i]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {comparisons.map((c, i) => (
              <div key={c.etiqueta} className="text-xs text-[#5b6a62] flex gap-2 items-start">
                <span className="h-2.5 w-2.5 rounded-full mt-0.5 shrink-0" style={{ background: COLORS[i] }} />
                <span>
                  <strong className="text-[#263238]">{c.etiqueta}</strong> — costo total {c.costoTotal.toFixed(2)}, {c.lengthKm.toFixed(2)} km.
                  Aportan mayor resistencia: {c.aportes.slice(0, 3).map((a) => `${a.nombre} (${a.aporte.toFixed(2)})`).join(', ')}.
                  {i === 0 && alt1 && (
                    <span className="block text-[#397D91] mt-1">{explainSelection({ ...optima, weights: scenario.weights } as CorridorLike, { ...alt1, weights: scenario.weights } as CorridorLike)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Indicadores ambientales */}
        <section className="bg-white rounded border border-[#dfe5e0] p-4">
          <h3 className="font-medium text-[#263238] flex items-center gap-2 text-sm">
            <Leaf className="h-4 w-4 text-[#27865B]" /> Beneficio ambiental potencial (simulado)
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            <BenefitCard label="Beneficio térmico" value={`Hasta ${benefitTemp(optima)} °C`} note="Referencial, no validado" />
            <BenefitCard label="Infiltración" value={`${benefitInf(optima)} mm/h`} note="Potencial en suelo permeable" />
            <BenefitCard label="Escorrentía" value={`Hasta ${benefitEsc(optima)} %`} note="Reducción potencial" />
            <BenefitCard label="Conectividad" value={`+${benefitConn(optima)} pts`} note="Índice referencial" />
            <BenefitCard label="Cobertura vegetal" value={`+${benefitVeg(optima)} %`} note="Incremento potencial" />
            <BenefitCard label="Beneficio social" value={`${benefitSoc(optima)} pts`} note="Índice referencial" />
          </div>
        </section>

        {/* Ponderaciones del escenario */}
        <section className="bg-white rounded border border-[#dfe5e0] p-4">
          <h3 className="font-medium text-[#263238] flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-[#27865B]" /> Ponderaciones del escenario actual
          </h3>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(scenario.weights).map(([k, v]) => ({ criterio: k, peso: v }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="criterio" tick={{ fontSize: 9 }} width={95} />
                <ReTooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="peso" radius={[0, 3, 3, 0]}>
                  {Object.entries(scenario.weights).map((_, i) => (
                    <Cell key={i} fill={['#174D38', '#27865B', '#397D91', '#5CA97F', '#B8DCC5', '#E7A44A', '#C65B50', '#8a968e', '#2E7D4F', '#6a7a86', '#a4712c', '#4CA97B'][i % 12]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

function BenefitCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded border border-[#dfe5e0] p-3">
      <div className="text-[10px] uppercase tracking-wide text-[#5b6a62]">{label}</div>
      <div className="text-base font-semibold text-[#263238] mt-0.5">{value}</div>
      <div className="text-[10px] text-[#8a968e]">{note}</div>
    </div>
  );
}

const avg = (r: CorridorResult, k: keyof CorridorResult['promInd']) => r.promInd[k] / 100;
const benefitTemp = (r: CorridorResult) => (avg(r, 'temperatura') * 0.8 + 0.4).toFixed(1);
const benefitInf = (r: CorridorResult) => (avg(r, 'humedad') * 55 + 15).toFixed(1);
const benefitEsc = (r: CorridorResult) => (avg(r, 'inundacion') * 32 + 8).toFixed(0);
const benefitConn = (r: CorridorResult) => (avg(r, 'conectividad') * 45 + 25).toFixed(1);
const benefitVeg = (r: CorridorResult) => (avg(r, 'vegetacion') * 30 + 10).toFixed(1);
const benefitSoc = (r: CorridorResult) => (avg(r, 'vulnerabilidad') * 40 + avg(r, 'densidad') * 35 + 15).toFixed(1);
