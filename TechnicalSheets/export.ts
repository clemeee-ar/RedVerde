import { jsPDF } from 'jspdf';
import { NODE_BY_ID } from '@/corridors';
import { EJE_BY_ID } from '@/corridors';
import { CRITERIA } from '@/criteria';
import { normalizeWeights, economicEstimates, environmentalBenefits, formatUF } from '@/leastCostPath';
import { compareRoutes, explainSelection, type CorridorLike } from '@/indicators/comparison';
import { recommendSpecies } from '@/indicators/speciesRecommendation';
import type { CorridorResult, Weights } from '@/index';
import { useScenario } from '@/scenario';

const GREEN = [23, 77, 56] as const;
const LIGHT = [184, 220, 197] as const;

function header(doc: jsPDF, titulo: string) {
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CORREDOR VIVO SANTIAGO', 14, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Plataforma de planificación y optimización de infraestructura verde urbana', 14, 18);
  doc.text('Prototipo de innovación territorial | Región Metropolitana', 14, 23);
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(titulo, 14, 36);
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFillColor(...LIGHT);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, 16, y + 5);
  return y + 11;
}

function rows(doc: jsPDF, y: number, pairs: [string, string][]): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const [k, v] of pairs) {
    doc.setTextColor(90, 100, 95);
    doc.text(k, 16, y);
    doc.setTextColor(38, 50, 56);
    doc.text(v, 95, y);
    y += 5.5;
  }
  return y + 3;
}

export function generateTechnicalSheet(
  optima: CorridorResult,
  alt1: CorridorResult | null,
  alt2: CorridorResult | null,
  weights: Weights,
  meta: { origen: string; destino: string; eje: string; comuna: string; sector: string }
) {
  const doc = new jsPDF();
  const wNorm = normalizeWeights(weights);
  const eco = economicEstimates(optima);
  const amb = environmentalBenefits(optima);
  const fecha = new Date().toLocaleString('es-CL');

  header(doc, 'Ficha técnica de corredor');

  let y = sectionTitle(doc, 42, '1. Identificación');
  y = rows(doc, y, [
    ['Nombre del corredor', `${NODE_BY_ID[meta.origen]?.nombre} – ${NODE_BY_ID[meta.destino]?.nombre}`],
    ['Fecha de generación', fecha],
    ['Comunas involucradas', meta.comuna],
    ['Sector', meta.sector],
    ['Punto de origen', NODE_BY_ID[meta.origen]?.nombre ?? meta.origen],
    ['Punto de destino', NODE_BY_ID[meta.destino]?.nombre ?? meta.destino],
    ['Eje vial', EJE_BY_ID[meta.eje as 'vm']?.nombre ?? meta.eje],
  ]);

  y = sectionTitle(doc, y, '2. Características físicas');
  y = rows(doc, y, [
    ['Longitud', `${optima.lengthKm.toFixed(2)} km`],
    ['Ancho promedio del bandejón', `${optima.anchoProm.toFixed(1)} m`],
    ['Superficie intervenible', `${eco.superficieM2.toLocaleString('es-CL')} m²`],
    ['Número estimado de árboles', eco.arboles.toLocaleString('es-CL')],
    ['Número estimado de arbustos', eco.arbustos.toLocaleString('es-CL')],
  ]);

  y = sectionTitle(doc, y, '3. Evaluación ambiental (simulada)');
  y = rows(doc, y, [
    ['Beneficio térmico referencial', `hasta ${amb.beneficioTermico} °C`],
    ['Beneficio hídrico (infiltración)', `${amb.infiltracion} mm/h potencial`],
    ['Reducción de escorrentía', `hasta ${amb.escorrentia} %`],
    ['Beneficio ecológico', `+${amb.conectividad} pts conectividad`],
    ['Incremento cobertura vegetal', `+${amb.coberturaVegetal} % potencial`],
    ['Beneficio social', `${amb.beneficioSocial} pts (referencial)`],
    ['Riesgos identificados', `Inundación ${optima.promInd.inundacion.toFixed(0)}/100, tránsito ${optima.promInd.trafico.toFixed(0)}/100 (simulado)`],
  ]);

  y = sectionTitle(doc, y, '4. Evaluación económica');
  y = rows(doc, y, [
    ['Costo de implementación', formatUF(eco.costoImplementacionUF)],
    ['Costo de mantenimiento anual', formatUF(eco.costoMantAnualUF)],
  ]);

  y = sectionTitle(doc, y, '5. Justificación técnica');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(38, 50, 56);
  const criteriosTxt = CRITERIA.map((c) => `${c.nombre}: ${Math.round(wNorm[c.id] * 100)}%`).join(' · ');
  const justification = explainSelection({ ...optima, weights } as CorridorLike, alt1 ? { ...alt1, weights } as CorridorLike : null);
  const wrapped = doc.splitTextToSize(criteriosTxt, 182) as string[];
  for (const line of wrapped) {
    doc.text(line, 16, y);
    y += 4.5;
  }
  y += 1;
  const wrapped2 = doc.splitTextToSize(justification, 182) as string[];
  for (const line of wrapped2) {
    doc.text(line, 16, y);
    y += 4.5;
  }
  y += 3;

  // Comparación de alternativas
  const comps = compareRoutes([
    { ...optima, weights },
    ...(alt1 ? [{ ...alt1, weights }] : []),
    ...(alt2 ? [{ ...alt2, weights }] : []),
  ]);
  y = sectionTitle(doc, y, '6. Comparación de alternativas');
  for (const c of comps) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(38, 50, 56);
    doc.text(`${c.etiqueta} — costo ${c.costoTotal.toFixed(2)}, ${c.lengthKm.toFixed(2)} km`, 16, y);
    y += 5;
  }
  y += 2;

  // Especies recomendadas por primer tramo
  y = sectionTitle(doc, y, '7. Especies recomendadas (primer tramo, referencial)');
  const recs = recommendSpecies(optima.segments[0]);
  for (const r of recs) {
    doc.setFontSize(9);
    doc.text(`${r.species.nombreComun} (${r.species.nombreCientifico}) — estrato ${r.species.estrato}`, 16, y);
    y += 4.5;
    const j = doc.splitTextToSize(r.justificacion, 182) as string[];
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 95);
    for (const line of j) {
      doc.text(line, 20, y);
      y += 4;
    }
    y += 2;
  }

  // Representación gráfica simple del corredor
  y = sectionTitle(doc, y + 2, '8. Representación gráfica');
  const pts = optima.segments.flatMap((s) => s.latlngs);
  if (pts.length > 0) {
    const lats = pts.map((p) => p[0]);
    const lngs = pts.map((p) => p[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const boxX = 30, boxY = y, boxW = 150, boxH = 60;
    doc.setDrawColor(...LIGHT);
    doc.setFillColor(245, 247, 245);
    doc.rect(boxX, boxY, boxW, boxH, 'FD');
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(1.4);
    const scale = (p: [number, number]): [number, number] => [
      boxX + ((p[1] - minLng) / (maxLng - minLng || 1)) * (boxW - 20) + 10,
      boxY + (1 - (p[0] - minLat) / (maxLat - minLat || 1)) * (boxH - 16) + 8,
    ];
    for (const seg of optima.segments) {
      const scaled = seg.latlngs.map(scale);
      for (let i = 0; i < scaled.length - 1; i++) {
        doc.line(scaled[i][0], scaled[i][1], scaled[i + 1][0], scaled[i + 1][1]);
      }
    }
    y += boxH + 6;
  }

  // Advertencia
  doc.setFontSize(8);
  doc.setTextColor(199, 116, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('ESCENARIO DEMOSTRATIVO — DATOS SIMULADOS', 14, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 130, 125);
  const warn = doc.splitTextToSize(
    'Esta ficha fue generada por un prototipo demostrativo con datos simulados. No constituye un levantamiento cartográfico, medición ambiental validada ni recomendación técnica oficial.',
    182
  ) as string[];
  let wy = y + 7;
  for (const line of warn) {
    doc.text(line, 14, wy);
    wy += 4;
  }

  doc.save('ficha-tecnica-corredor-vivo.pdf');
}

export function useTechnicalSheetExport() {
  const { scenario } = useScenario();
  return (optima: CorridorResult, alt1: CorridorResult | null, alt2: CorridorResult | null) => {
    generateTechnicalSheet(optima, alt1, alt2, scenario.weights, {
      origen: scenario.origen,
      destino: scenario.destino,
      eje: scenario.eje,
      comuna: scenario.comuna,
      sector: scenario.sector,
    });
  };
}
