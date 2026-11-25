import { useState } from 'react';
import { Droplets, Sun, Tractor, Leaf, Info } from 'lucide-react';
import { SPECIES, SPECIES_PHOTOS } from '@/species';
import type { Species } from '@/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/ui/dialog';
import { cn } from '@/utils';

const ESTRATOS = [
  { id: 'todas', label: 'Todas' },
  { id: 'arbol', label: 'Árboles' },
  { id: 'arbusto', label: 'Arbustos' },
  { id: 'herbacea', label: 'Herbáceas' },
];

const ESTRATO_LABEL: Record<string, string> = { arbol: 'Árbol', arbusto: 'Arbusto', herbacea: 'Herbácea' };

export function BiodiversityPage() {
  const [estrato, setEstrato] = useState('todas');
  const [selected, setSelected] = useState<Species | null>(null);

  const filtered = SPECIES.filter((s) => estrato === 'todas' || s.estrato === estrato);

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F5F7F5]">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="bg-[#397D91]/10 border border-[#397D91]/30 text-[#2a5c68] text-xs rounded px-3 py-2 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Características botánicas referenciales con fines demostrativos, sujetas a validación técnica. Las fotografías son ilustrativas y no corresponden a ejemplares específicos de la especie.
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#263238]">Catálogo de especies nativas</h2>
            <p className="text-xs text-[#5b6a62] mt-0.5">
              Tres estratos vegetales: árboles de copa media, arbustos y vegetación herbácea nativa.
            </p>
          </div>
          <div className="flex gap-1 bg-white border border-[#dfe5e0] rounded p-1">
            {ESTRATOS.map((e) => (
              <button
                key={e.id}
                onClick={() => setEstrato(e.id)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded transition-colors',
                  estrato === e.id ? 'bg-[#27865B] text-white font-medium' : 'text-[#5b6a62] hover:bg-[#F5F7F5]'
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {estrato === 'herbacea' && (
          <div className="bg-[#F5F7F5] border border-[#dfe5e0] rounded p-4 text-sm text-[#5b6a62]">
            La capa herbácea nativa se encuentra pendiente de caracterización botánica. El prototipo no recomienda
            automáticamente especies para este estrato hasta contar con una especie validada.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="text-left bg-white rounded border border-[#dfe5e0] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-[#e8efe9]">
                <img
                  src={SPECIES_PHOTOS[s.id]}
                  alt={s.nombreComun}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-[#263238]">{s.nombreComun}</div>
                <div className="text-[11px] italic text-[#5b6a62]">{s.nombreCientifico}</div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <Tag>{ESTRATO_LABEL[s.estrato]}</Tag>
                  <Tag>Sequía: {s.resistenciaSequia}</Tag>
                  <Tag>{s.exposicionSolar}</Tag>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-left text-[#263238]">
                    {selected.nombreComun} <span className="italic font-normal text-[#5b6a62]">({selected.nombreCientifico})</span>
                  </DialogTitle>
                  <DialogDescription className="text-left">
                    Ficha referencial demostrativa · Estrato: {ESTRATO_LABEL[selected.estrato]}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Trait icon={Droplets} label="Requerimiento hídrico" value={selected.hidrico} />
                  <Trait icon={Tractor} label="Resistencia a sequía" value={selected.resistenciaSequia} />
                  <Trait icon={Sun} label="Exposición solar" value={selected.exposicionSolar} />
                </div>
                <div className="space-y-2 text-xs mt-2">
                  <InfoRow label="Función ecológica" value={selected.funcionEcologica} />
                  <InfoRow label="Función hídrica" value={selected.funcionHidrica} />
                  <InfoRow label="Adecuación urbana" value={selected.adecuacionUrbana} />
                  <InfoRow label="Bandejón estrecho" value={selected.aptoBandejonEstrecho ? 'Compatible (referencial)' : 'Requiere espacio mayor'} />
                  <InfoRow label="Tolerancia a contaminación" value={selected.toleraContaminacion ? 'Referencial: tolerante' : 'Referencial: moderada'} />
                </div>
                <p className="text-[10px] text-[#a4712c] flex gap-1 mt-2">
                  <Leaf className="h-3 w-3 shrink-0 mt-0.5" />
                  Características demostrativas referenciales; toda decisión de plantación requiere validación técnica en terreno.
                </p>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] bg-[#F5F7F5] border border-[#e6ebe7] text-[#5b6a62] rounded px-1.5 py-0.5">{children}</span>;
}

function Trait({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="border border-[#e6ebe7] rounded p-2">
      <Icon className="h-3.5 w-3.5 text-[#27865B] mb-1" />
      <div className="text-[9px] uppercase tracking-wide text-[#8a968e]">{label}</div>
      <div className="text-[#263238] font-medium capitalize">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#5b6a62] font-medium w-44 shrink-0">{label}:</span>
      <span className="text-[#263238]">{value}</span>
    </div>
  );
}
