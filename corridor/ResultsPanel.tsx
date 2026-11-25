import { BarChart3, GitCompare, Info, Leaf, Route } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts';
import type { CorridorResult, Weights } from '@/index';
import { economicEstimates, environmentalBenefits, formatUF } from '@/leastCostPath';
import { compareRoutes, explainSelection, type CorridorLike } from '@/indicators/comparison';
import { NODE_BY_ID } from '@/corridors';

interface Props {
  optima: CorridorResult | null;
  alt1: CorridorResult | null;
  alt2: CorridorResult | null;
  weights: Weights;
  selectedRoute: string | null;
  onSelectRoute: (v: string) => void;
  onExport: () => void;
}

export function ResultsPanel({ optima, alt1, alt2, weights, selectedRoute, onSelectRoute, onExport }: Props) {
  const active = selectedRoute === 'alt1' ? alt1 : selectedRoute === 'alt2' ? alt2 : optima;
  const wNormInput: Weights = weights;
  const comparisons = compareRoutes([
    optima ? { ...optima, weights: wNormInput } : null,
    alt1 ? { ...alt1, weights: wNormInput } : null,
    alt2 ? { ...alt2, weights: wNormInput } : null,
  ]);

  if (!optima) {
    return (
      <div className="p-6 text-sm text-[#5b6a62] flex flex-col items-center justify-center h-full text-center gap-2">
        <Route className="h-8 w-8 text-[#B8DCC5]" />
        <p className="font-medium text-[#263238]">Sin corredor generado</p>
        <p className="text-xs leading-relaxed">Ajusta la configuración territorial y las ponderaciones, luego presiona “Generar corredor”.</p>
      </div>
    );
  }

  const eco = economicEstimates(active ?? optima);
  const amb = environmentalBenefits(active ?? optima);
  const weightData = comparisons[0]?.aportes.slice(0, 6).map((a) => ({ nombre: a.nombre.split(' ')[0], aporte: Math.round(a.aporte * 100) / 100 })) ?? [];

  return (
    <div className="overflow-y-auto p-4 h-full space-y-5">
      {/* Selector de ruta */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-2">Rutas calculadas</h3>
        <div className="space-y-1.5">
          {[optima, alt1, alt2].filter(Boolean).map((r) => (
            <button
              key={r!.id}
              onClick={() => onSelectRoute(r!.variant)}
              className={`w-full text-left rounded border px-3 py-2 transition-all ${
                (selectedRoute ?? 'optima') === r!.variant
                  ? 'border-[#27865B] bg-[#27865B]/5 shadow-sm'
                  : 'border-[#dfe5e0] hover:bg-[#F5F7F5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-[#263238]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r!.color }} />
                  {r!.etiqueta}
                </span>
                <span className="text-[11px] text-[#7a8880] tabular-nums">{r!.lengthKm.toFixed(1)} km</span>
              </div>
              <div className="text-[10px] text-[#8a968e] mt-0.5">Costo total ponderado: {r!.costoTotal.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Indicadores principales */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-2">Indicadores principales</h3>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Longitud estimada" value={`${(active ?? optima).lengthKm.toFixed(2)} km`} />
          <Metric label="Ancho promedio" value={`${(active ?? optima).anchoProm.toFixed(1)} m`} />
          <Metric label="Superficie intervenible" value={`${eco.superficieM2.toLocaleString('es-CL')} m²`} />
          <Metric label="Árboles estimados" value={eco.arboles.toLocaleString('es-CL')} />
          <Metric label="Arbustos estimados" value={eco.arbustos.toLocaleString('es-CL')} />
          <Metric label="Costo implementación" value={formatUF(eco.costoImplementacionUF)} />
          <Metric label="Mantención anual" value={formatUF(eco.costoMantAnualUF)} />
        </div>
      </section>

      {/* Indicadores ambientales */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-2">Beneficios potenciales (simulados)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Beneficio térmico ref." value={`hasta ${amb.beneficioTermico} °C`} />
          <Metric label="Infiltración potencial" value={`${amb.infiltracion} mm/h`} />
          <Metric label="Reducción escorrentía" value={`hasta ${amb.escorrentia} %`} />
          <Metric label="Conectividad ecológica" value={`+${amb.conectividad} pts`} />
          <Metric label="Cobertura vegetal" value={`+${amb.coberturaVegetal} %`} />
          <Metric label="Beneficio social ref." value={`${amb.beneficioSocial} pts`} />
        </div>
        <p className="text-[10px] text-[#a4712c] flex items-start gap-1 mt-2 leading-snug">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          Valores referenciales simulados; no constituyen mediciones validadas ni predicciones comprobadas.
        </p>
      </section>

      {/* Gráfico de aportes */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-2 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Aportes al costo por criterio
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weightData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e6ebe7" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10 }} width={70} />
              <ReTooltip formatter={(v: number) => v.toFixed(2)} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="aporte" radius={[0, 3, 3, 0]}>
                {weightData.map((_, i) => (
                  <Cell key={i} fill={['#174D38', '#27865B', '#397D91', '#5CA97F', '#B8DCC5', '#8a968e'][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Comparación de rutas */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-2 flex items-center gap-1.5">
          <GitCompare className="h-3.5 w-3.5" /> Comparación de alternativas
        </h3>
        <div className="space-y-2">
          {comparisons.map((c, idx) => (
            <div key={c.etiqueta} className="border border-[#dfe5e0] rounded p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#263238] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.etiqueta}
                </span>
                <span className="text-[#7a8880] tabular-nums">{c.costoTotal.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-[#5b6a62] mt-1 leading-snug">
                Favorecen: {c.aportes.slice(-2).reverse().map((a) => a.nombre).join(', ') || '—'}.{' '}
                Perjudican: {c.aportes.slice(0, 2).map((a) => a.nombre).join(', ')}.
              </div>
              {idx === 0 && alt1 && (
                <p className="text-[10px] text-[#397D91] mt-1.5 leading-snug flex gap-1">
                  <Leaf className="h-3 w-3 shrink-0 mt-0.5" /> {explainSelection(
                    { ...optima, weights: wNormInput } as CorridorLike,
                    { ...alt1, weights: wNormInput } as CorridorLike
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Prioridad y riesgo */}
      <section className="grid grid-cols-2 gap-2">
        <div className="rounded border border-[#dfe5e0] p-3">
          <div className="text-[10px] uppercase tracking-wide text-[#5b6a62]">Prioridad territorial</div>
          <div className="text-lg font-semibold text-[#27865B]">{prioridadLabel(optima.promInd)}</div>
        </div>
        <div className="rounded border border-[#dfe5e0] p-3">
          <div className="text-[10px] uppercase tracking-wide text-[#5b6a62]">Riesgo residual</div>
          <div className="text-lg font-semibold" style={{ color: riesgoColor(optima.promInd) }}>{riesgoLabel(optima.promInd)}</div>
        </div>
      </section>

      <button onClick={onExport} className="w-full text-sm bg-[#174D38] hover:bg-[#0f3826] text-white rounded py-2.5 transition-colors">
        Generar ficha técnica PDF
      </button>
      <p className="text-[10px] text-[#8a968e] leading-snug">
        Origen: {NODE_BY_ID[optima.segments[0]?.from]?.nombre ?? '—'} · Destino:{' '}
        {NODE_BY_ID[optima.segments[optima.segments.length - 1]?.to]?.nombre ?? '—'}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#dfe5e0] bg-white p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[#5b6a62] leading-tight">{label}</div>
      <div className="text-sm font-semibold text-[#263238] mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function prioridadLabel(p: CorridorResult['promInd']): string {
  const score = (p.vulnerabilidad + p.densidad + (100 - p.acceso) * -1 + 100) / 3 + p.temperatura / 5;
  return score > 75 ? 'Alta' : score > 60 ? 'Media-alta' : 'Media';
}
function riesgoLabel(p: CorridorResult['promInd']): string {
  const r = (p.inundacion + p.trafico + p.costoMant) / 3;
  return r > 60 ? 'Medio-alto' : r > 45 ? 'Medio' : 'Bajo';
}
function riesgoColor(p: CorridorResult['promInd']): string {
  const r = (p.inundacion + p.trafico + p.costoMant) / 3;
  return r > 60 ? '#C65B50' : r > 45 ? '#E7A44A' : '#27865B';
}
