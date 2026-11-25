import type { EdgeIndicators, Species } from '../../types';
import type { SegmentResult } from '../../types';
import { SPECIES } from '../../data/species';
import { CRITERIA_BY_ID } from '../../data/criteria';

export interface SegmentRecommendationResult {
  species: Species;
  justificacion: string;
}

/**
 * Recomendación demostrativa por tramo según condiciones del segmento.
 * Solo sugiere; toda decisión requiere validación en terreno.
 */
export function recommendSpecies(seg: SegmentResult): SegmentRecommendationResult[] {
  const out: SegmentRecommendationResult[] = [];
  const ancho = seg.anchoProm;
  const sol = (seg.ind.temperatura ?? 50) >= 60 ? 'alta' : 'media';
  const agua = (seg.ind.humedad ?? 50) >= 55 ? 'disponible' : 'restringida';
  const contaminacion = (seg.ind.trafico ?? 50) >= 65 ? 'alta' : 'media';

  const arboles = SPECIES.filter((s) => s.estrato === 'arbol');
  const arbustos = SPECIES.filter((s) => s.estrato === 'arbusto');

  const arbolesAptos = arboles.filter((s) => {
    if (ancho < 7 && !s.aptoBandejonEstrecho) return false;
    if (sol === 'alta' && !s.exposicionSolar.includes('pleno') && !s.exposicionSolar.includes('sol/')) return false;
    return true;
  });
  const arbustosAptos = arbustos.filter((s) => {
    if (sol === 'alta' && !s.exposicionSolar.includes('pleno') && !s.exposicionSolar.includes('sol/')) return false;
    return true;
  });

  const pickArbol = arbolesAptos.sort((a, b) => scoreTree(a, seg.ind) - scoreTree(b, seg.ind))[0];
  if (pickArbol) {
    out.push({
      species: pickArbol,
      justificacion: `El ${pickArbol.nombreComun} se considera como alternativa para este tramo por su ${pickArbol.resistenciaSequia === 'alta' ? 'alta resistencia a la sequía' : 'resistencia media a la sequía'} y ${pickArbol.exposicionSolar === 'pleno sol' ? 'buena adaptación a exposición solar' : 'tolerancia a condiciones mixtas'}. Sujeto a disponibilidad de espacio (ancho ${ancho.toFixed(1)} m) y validación de las condiciones del suelo.`,
    });
  }

  const pickArbusto = arbustosAptos.sort((a, b) => scoreShrub(a, seg.ind) - scoreShrub(b, seg.ind))[0];
  if (pickArbusto) {
    out.push({
      species: pickArbusto,
      justificacion: `El ${pickArbusto.nombreComun} se sugiere como estrato arbustivo por su rusticidad y bajo requerimiento hídrico (agua ${agua}). Referencial: requiere validación botánica en terreno.`,
    });
  }

  return out;
}

function scoreTree(s: Species, ind: EdgeIndicators): number {
  let score = 0;
  if (s.resistenciaSequia === 'alta') score -= 2;
  else if (s.resistenciaSequia === 'media') score += 1;
  if (s.toleraContaminacion && (ind.trafico ?? 50) >= 60) score -= 1;
  if ((ind.temperatura ?? 50) >= 70 && s.exposicionSolar === 'pleno sol') score -= 1;
  return score;
}

function scoreShrub(s: Species, ind: EdgeIndicators): number {
  let score = 0;
  if (s.resistenciaSequia === 'alta') score -= 2;
  if ((ind.trafico ?? 50) >= 65 && s.toleraContaminacion) score -= 1;
  return score;
}

export const STRATUM_LABEL: Record<string, string> = {
  arbol: 'Árbol',
  arbusto: 'Arbusto',
  herbacea: 'Herbácea',
};

export const CRIT_NOTA = (id: string) => CRITERIA_BY_ID[id]?.nota ?? '';
