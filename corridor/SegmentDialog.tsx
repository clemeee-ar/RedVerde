import { Droplets, Sun, Tractor } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import type { SegmentResult } from '../../types';
import { recommendSpecies } from '../../algorithms/indicators/speciesRecommendation';
import { SPECIES_PHOTOS } from '../../data/species';
import { NODE_BY_ID } from '../../data/corridors';

interface Props {
  segment: SegmentResult | null;
  open: boolean;
  onClose: () => void;
}

export function SegmentDialog({ segment, open, onClose }: Props) {
  if (!segment) return null;
  const recs = recommendSpecies(segment);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left text-[#263238]">{segment.nombre}</DialogTitle>
          <DialogDescription className="text-left">
            Tramo {NODE_BY_ID[segment.from]?.nombre} → {NODE_BY_ID[segment.to]?.nombre} · {segment.lengthKm.toFixed(2)} km ·
            Ancho promedio {segment.anchoProm} m
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(segment.ind).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border border-[#e6ebe7] rounded px-2 py-1.5">
              <span className="text-[#5b6a62]">{k}</span>
              <span className="font-medium text-[#263238] tabular-nums">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#a4712c]">Indicadores normalizados 0–100, simulados para demostración.</p>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5b6a62] mb-2">Especies potencialmente recomendadas</h4>
          {recs.length === 0 && (
            <p className="text-xs text-[#8a968e]">Sin recomendación automática para este tramo; requiere caracterización botánica.</p>
          )}
          <div className="space-y-2">
            {recs.map((r) => (
              <div key={r.species.id} className="flex gap-3 border border-[#dfe5e0] rounded p-2.5">
                <img
                  src={r.species.fotoUrl ?? SPECIES_PHOTOS[r.species.id]}
                  alt={r.species.nombreComun}
                  className="h-16 w-16 rounded object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#263238]">{r.species.nombreComun}</div>
                  <div className="text-[11px] italic text-[#5b6a62]">{r.species.nombreCientifico}</div>
                  <div className="text-[11px] text-[#5b6a62] flex flex-wrap gap-x-3 mt-1">
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> Hídrico: {r.species.hidrico}</span>
                    <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> {r.species.exposicionSolar}</span>
                    <span className="flex items-center gap-1"><Tractor className="h-3 w-3" /> Sequía: {r.species.resistenciaSequia}</span>
                  </div>
                </div>
              </div>
            ))}
            {recs.map((r) => (
              <p key={`j-${r.species.id}`} className="text-[11px] text-[#397D91] leading-snug">{r.justificacion}</p>
            ))}
            <p className="text-[10px] text-[#8a968e]">
              La capa herbácea nativa está pendiente de caracterización botánica y no se recomienda automáticamente.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
