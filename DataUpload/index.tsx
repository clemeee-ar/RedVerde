import { useRef, useState } from 'react';
import { FileUp, FileCheck2, FileX2, Download, FolderUp, Info } from 'lucide-react';
import { useScenario } from '@/scenario';
import type { UploadedDataset } from '@/index';

const CSV_TEMPLATE = `nombre,lat,lng,indicador,valor
Parque Demo, -33.45, -70.66, temperatura, 62
Tramo Demo, -33.48, -70.64, temperatura, 71`;

const GEOJSON_TEMPLATE = JSON.stringify(
  {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { nombre: 'Zona demo', valor: 70 },
        geometry: { type: 'Point', coordinates: [-70.65, -33.46] },
      },
    ],
  },
  null,
  2
);

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataUploadPage() {
  const { scenario, update } = useScenario();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ name: string; kind: 'CSV' | 'GeoJSON'; content: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = (file: File) => {
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    const isGeo = file.name.toLowerCase().endsWith('.geojson') || file.name.toLowerCase().endsWith('.json');
    if (!isCsv && !isGeo) {
      setPending(null);
      update({
        uploads: [
          ...scenario.uploads,
          {
            id: crypto.randomUUID(),
            fileName: file.name,
            kind: isCsv ? 'CSV' : 'GeoJSON',
            tipoInfo: 'No reconocido',
            estado: 'error',
            registros: 0,
            mensajes: ['Formato no soportado. Use CSV o GeoJSON.'],
            cargadoEn: new Date().toLocaleString('es-CL'),
          },
        ],
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPending({ name: file.name, kind: isCsv ? 'CSV' : 'GeoJSON', content: String(reader.result ?? '') });
    reader.readAsText(file);
  };

  const validateAndLoad = () => {
    if (!pending) return;
    setProcessing(true);
    const mensajes: string[] = [];
    let registros = 0;
    let estado: 'validado' | 'error' = 'error';
    let tipoInfo = 'No determinado';

    try {
      if (pending.kind === 'CSV') {
        const lines = pending.content.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          mensajes.push('El archivo no contiene registros de datos además del encabezado.');
        } else {
          const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
          const hasCoords = header.includes('lat') && header.includes('lng');
          registros = lines.length - 1;
          if (!hasCoords) mensajes.push('Faltan columnas "lat" y "lng"; los registros se importan sin georreferencia.');
          else mensajes.push(`Columnas detectadas: ${header.join(', ')}.`);
          const badRows = lines.slice(1).filter((l) => l.split(',').length !== header.length).length;
          if (badRows > 0) mensajes.push(`${badRows} fila(s) con número de columnas inconsistente fueron ignoradas.`);
          estado = registros > 0 ? 'validado' : 'error';
          tipoInfo = 'Tabla de indicadores (CSV)';
        }
      } else {
        const json = JSON.parse(pending.content);
        if (json?.type === 'FeatureCollection' && Array.isArray(json.features)) {
          registros = json.features.length;
          estado = registros > 0 ? 'validado' : 'error';
          tipoInfo = 'Colección GeoJSON';
          mensajes.push(`FeatureCollection válida con ${registros} elemento(s).`);
          const invalidGeom = json.features.filter((f: { geometry?: unknown }) => !f.geometry).length;
          if (invalidGeom > 0) mensajes.push(`${invalidGeom} elemento(s) sin geometría.`);
        } else {
          mensajes.push('El archivo no es un GeoJSON FeatureCollection válido.');
        }
      }
    } catch (e) {
      mensajes.push(`Error de lectura: ${e instanceof Error ? e.message : 'formato inválido'}`);
    }

    update({
      uploads: [
        ...scenario.uploads,
        {
          id: crypto.randomUUID(),
          fileName: pending.name,
          kind: pending.kind,
          tipoInfo,
          estado,
          registros,
          mensajes: mensajes.length ? mensajes : ['Sin observaciones.'],
          cargadoEn: new Date().toLocaleString('es-CL'),
        },
      ],
    });
    setPending(null);
    setProcessing(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F5F7F5]">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-[#397D91]/10 border border-[#397D91]/30 text-[#2a5c68] text-xs rounded px-3 py-2 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          La aplicación funciona completamente con datos demostrativos sin cargar archivos. Los archivos cargados se validan localmente en el navegador y no alteran la base de cálculo del prototipo.
        </div>

        <section className="bg-white rounded border border-[#dfe5e0] p-5">
          <h3 className="font-medium text-[#263238] flex items-center gap-2 text-sm">
            <FolderUp className="h-4 w-4 text-[#27865B]" /> Cargar archivo propio
          </h3>
          <p className="text-xs text-[#5b6a62] mt-1">Formatos aceptados: CSV y GeoJSON.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.geojson,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-3 w-full border-2 border-dashed border-[#c5d2ca] rounded-lg py-8 flex flex-col items-center gap-2 text-[#5b6a62] hover:border-[#27865B] hover:text-[#27865B] transition-colors"
          >
            <FileUp className="h-6 w-6" />
            <span className="text-sm font-medium">Seleccionar archivo CSV o GeoJSON</span>
          </button>

          {pending && (
            <div className="mt-3 border border-[#dfe5e0] rounded p-3 text-xs space-y-2">
              <div className="font-medium text-[#263238]">{pending.name} — listo para validar</div>
              <div className="flex gap-2">
                <button
                  onClick={validateAndLoad}
                  disabled={processing}
                  className="bg-[#27865B] hover:bg-[#1e6b48] disabled:opacity-50 text-white rounded px-3 py-1.5 transition-colors"
                >
                  {processing ? 'Procesando…' : 'Validar y cargar'}
                </button>
                <button onClick={() => setPending(null)} className="border border-[#dfe5e0] rounded px-3 py-1.5 text-[#5b6a62] hover:bg-[#F5F7F5]">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded border border-[#dfe5e0] p-5">
          <h3 className="font-medium text-[#263238] text-sm mb-3">Plantillas descargables</h3>
          <div className="flex gap-2">
            <button
              onClick={() => download('plantilla-corredor-vivo.csv', CSV_TEMPLATE, 'text/csv')}
              className="flex items-center gap-2 text-xs border border-[#dfe5e0] rounded px-3 py-2 hover:bg-[#F5F7F5] transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Plantilla CSV
            </button>
            <button
              onClick={() => download('plantilla-corredor-vivo.geojson', GEOJSON_TEMPLATE, 'application/geo+json')}
              className="flex items-center gap-2 text-xs border border-[#dfe5e0] rounded px-3 py-2 hover:bg-[#F5F7F5] transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Plantilla GeoJSON
            </button>
          </div>
        </section>

        <section className="bg-white rounded border border-[#dfe5e0] p-5">
          <h3 className="font-medium text-[#263238] text-sm mb-3">Archivos cargados</h3>
          {scenario.uploads.length === 0 ? (
            <p className="text-xs text-[#8a968e]">Aún no se ha cargado ningún archivo. La aplicación opera con datos demostrativos.</p>
          ) : (
            <div className="space-y-2">
              {scenario.uploads.map((u: UploadedDataset) => (
                <div key={u.id} className="border border-[#dfe5e0] rounded p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#263238] flex items-center gap-1.5">
                      {u.estado === 'validado' ? (
                        <FileCheck2 className="h-3.5 w-3.5 text-[#27865B]" />
                      ) : (
                        <FileX2 className="h-3.5 w-3.5 text-[#C65B50]" />
                      )}
                      {u.fileName}
                    </span>
                    <span className={u.estado === 'validado' ? 'text-[#27865B]' : 'text-[#C65B50]'}>
                      {u.estado === 'validado' ? 'Validado' : 'Con errores'}
                    </span>
                  </div>
                  <div className="text-[#5b6a62]">
                    {u.kind} · {u.tipoInfo} · {u.registros} registro(s) · {u.cargadoEn}
                  </div>
                  {u.mensajes.map((m, i) => (
                    <div key={i} className="text-[#8a968e]">• {m}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
