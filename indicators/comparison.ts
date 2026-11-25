import type { EdgeIndicators, Weights } from '@/index';
import { CRITERIA } from '@/criteria';
import { normalizeWeights, resistance } from '../leastCostPath';
export interface RouteComparisonRow {
  etiqueta: string;
  color: string;
  costoTotal: number;
  lengthKm: number;
  aportes: { id: string; nombre: string; aporte: number }[];
}

/**
 * Compara rutas: descompone el costo total por criterio y explica
 * qué criterios favorecieron o perjudicaron a cada alternativa.
 */
export function compareRoutes(routes: (CorridorLike | null)[]): RouteComparisonRow[] {
  const out: RouteComparisonRow[] = [];
  for (const r of routes) {
    if (!r) continue;
    const wNorm = normalizeWeights(r.weights);
    const len = r.lengthKm || 1;
    const aportes = CRITERIA.map((c) => {
      const v = (r.promInd as unknown as Record<string, number>)[c.id] ?? 0;
      return { id: c.id, nombre: c.nombre, aporte: (wNorm[c.id] ?? 0) * resistance(c.id, v) * len };
    }).sort((a, b) => b.aporte - a.aporte);
    out.push({
      etiqueta: r.etiqueta,
      color: r.color,
      costoTotal: r.costoTotal,
      lengthKm: r.lengthKm,
      aportes,
    });
  }
  return out;
}

export interface CorridorLike {
  etiqueta: string;
  color: string;
  lengthKm: number;
  costoTotal: number;
  promInd: EdgeIndicators;
  weights: Weights;
}

/** Explicación textual de por qué la ruta óptima fue seleccionada */
export function explainSelection(optima: CorridorLike, alt: CorridorLike | null): string {
  const wNorm = normalizeWeights(optima.weights);
  const top = CRITERIA.map((c) => ({ c, w: wNorm[c.id] ?? 0 }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 3);
  let txt = `La ruta recomendada minimiza el costo total ponderado. Los criterios de mayor peso en este escenario son: ${top
    .map((t) => `${t.c.nombre} (${Math.round(t.w * 100)}%)`)
    .join(', ')}.`;
  if (alt) {
    const diff = alt.costoTotal - optima.costoTotal;
    if (diff > 0.001) {
      txt += ` La ${alt.etiqueta} presenta un costo total ${Math.round((diff / optima.costoTotal) * 100)}% superior en los criterios priorizados.`;
    } else {
      txt += ` La ${alt.etiqueta} obtiene un costo equivalente en este escenario.`;
    }
  }
  return txt;
}
