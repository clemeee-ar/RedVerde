import { useMemo } from 'react';
import { Info, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CRITERIA, DEFAULT_WEIGHTS } from '@/criteria';
import { COMUNAS, ORIGEN_OPTIONS, SECTORS } from '@/locations';
import { useScenario } from '@/scenario';
import { normalizeWeights } from '@/leastCostPath';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import * as LucideIcons from 'lucide-react';
import { EJES } from '@/corridors';
import { NODE_BY_ID } from '@/corridors';

interface Props {
  onGenerate: () => void;
}

export function ConfigPanel({ onGenerate }: Props) {
  const { scenario, update, reset } = useScenario();
  const wNorm = useMemo(() => normalizeWeights(scenario.weights), [scenario.weights]);
  const totalRaw = CRITERIA.reduce((s, c) => s + (scenario.weights[c.id] ?? 0), 0);

  const origenOptions = ORIGEN_OPTIONS;
  const destinoOptions = useMemo(
    () => Object.values(NODE_BY_ID).filter((n) => ['parque', 'nodo'].includes(n.tipo)),
    []
  );

  return (
    <div className="flex flex-col gap-5 overflow-y-auto p-4 h-full">
      {/* Selección territorial */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-3">Configuración territorial</h3>
        <div className="space-y-3">
          <Field label="Comuna / territorio">
            <Select value={scenario.comuna} onValueChange={(v) => update({ comuna: v })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{COMUNAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Sector">
            <Select value={scenario.sector} onValueChange={(v) => update({ sector: v })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(SECTORS[scenario.comuna] ?? [scenario.sector]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Eje vial principal">
            <Select value={scenario.eje} onValueChange={(v) => update({ eje: v as typeof scenario.eje })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EJES.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Punto de origen">
            <Select value={scenario.origen} onValueChange={(v) => update({ origen: v })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {origenOptions.map((n) => <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Punto de destino">
            <Select value={scenario.destino} onValueChange={(v) => update({ destino: v })}>
              <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {destinoOptions.map((n) => <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      {/* Ponderaciones */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Ponderación de criterios
          </h3>
          <span className="text-[11px] text-[#7a8880]">Normalizado: 100%</span>
        </div>
        <p className="text-[11px] text-[#5b6a62] bg-[#F5F7F5] border border-[#dfe5e0] rounded p-2.5 leading-relaxed mb-3">
          <Info className="inline h-3 w-3 mr-1 -mt-0.5 text-[#397D91]" />
          Los criterios <em>beneficio</em> reducen la resistencia (ej. conectividad ecológica); los criterios
          <em> resistencia</em> la aumentan (ej. riesgo hídrico o costos). La temperatura y el acceso a áreas verdes
          operan como <em>oportunidad de intervención</em>: mayor déficit, mayor prioridad.
        </p>
        <div className="space-y-4">
          {CRITERIA.map((c) => {
            const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[c.icono];
            return (
              <div key={c.id} className="group">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {Icon && <Icon className="h-3.5 w-3.5 text-[#27865B] shrink-0" />}
                    <span className="text-xs font-medium text-[#263238] truncate" title={c.descripcion}>{c.nombre}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#397D91] tabular-nums shrink-0">
                    {Math.round(wNorm[c.id] * 100)}%
                  </span>
                </div>
                <Slider
                  value={[scenario.weights[c.id] ?? 0]}
                  min={0} max={100} step={1}
                  onValueChange={([v]) => update({ weights: { ...scenario.weights, [c.id]: v } })}
                  className="py-1"
                />
                <div className="text-[10px] text-[#8a968e] leading-snug mt-0.5 hidden group-hover:block">{c.nota}</div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 border-[#dfe5e0]" onClick={() => update({ weights: { ...DEFAULT_WEIGHTS } })}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restablecer ponderaciones
          </Button>
          <Button size="sm" className="flex-1 bg-[#27865B] hover:bg-[#1e6b48] text-white" onClick={onGenerate}>
            Generar corredor
          </Button>
        </div>
        <div className="text-[10px] text-[#8a968e] mt-2">
          Suma bruta de sliders: {totalRaw} — se normaliza automáticamente a 100%.
        </div>
      </section>

      <Button variant="ghost" size="sm" className="text-[#8a968e]" onClick={reset}>
        Restablecer todo el escenario
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-[#5b6a62] block mb-1">{label}</span>
      {children}
    </label>
  );
}
