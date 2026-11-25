import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  accesoCells, densidadCells, riesgoHidricoCells, temperaturaCells, vegetacionCells, vulnerabilidadCells,
  type EnvironmentalCell,
} from '../../data/environmental';

import type { CriterionId } from '../../types';
import { cn } from '../../lib/utils';

interface IndicatorDef {
  id: string;
  nombre: string;
  descripcion: string;
  utilidad: string;
  unidad: string;
  cells: EnvironmentalCell[];
  color: string;
}

const INDICATORS: IndicatorDef[] = [
  {
    id: 'temperatura', nombre: 'Temperatura superficial', unidad: '°C relativo',
    descripcion: 'Intensidad estimada de islas de calor urbanas por sector.',
    utilidad: 'Identifica tramos donde la vegetación puede aportar mayor confort térmico.',
    cells: temperaturaCells, color: '#C65B50',
  },
  {
    id: 'ndvi', nombre: 'NDVI (cobertura vegetal)', unidad: 'índice 0-100',
    descripcion: 'Densidad relativa de vegetación vigente derivada de teledetección (simulada).',
    utilidad: 'Detecta vacíos verdes y corredores existentes que conviene reforzar.',
    cells: vegetacionCells, color: '#27865B',
  },
  {
    id: 'infiltracion', nombre: 'Infiltración', unidad: 'capacidad relativa',
    descripcion: 'Aptitud estimada del suelo para absorber y retener agua.',
    utilidad: 'Prioriza suelos aptos para biofiltros, zanjas y plantación.',
    cells: vegetacionCells.map((c) => ({ ...c, value: 100 - c.value })), color: '#397D91',
  },
  {
    id: 'escorrentia', nombre: 'Escorrentía', unidad: 'riesgo relativo',
    descripcion: 'Propensión a generación de flujos superficiales tras lluvia.',
    utilidad: 'Señala sectores donde el corredor puede moderar caudales.',
    cells: riesgoHidricoCells, color: '#E7A44A',
  },
  {
    id: 'riesgoHidrico', nombre: 'Riesgo hídrico', unidad: 'riesgo relativo',
    descripcion: 'Combinación referencial de inundación y déficit de drenaje.',
    utilidad: 'Limita la elección de especies y exige soluciones de drenaje.',
    cells: riesgoHidricoCells, color: '#8a6a3a',
  },
  {
    id: 'densidad', nombre: 'Densidad poblacional', unidad: 'hab./ha relativo',
    descripcion: 'Concentración de residentes por manzana (referencial).',
    utilidad: 'Estima cuántas personas se benefician del corredor.',
    cells: densidadCells, color: '#397D91',
  },
  {
    id: 'vulnerabilidad', nombre: 'Vulnerabilidad social', unidad: 'índice relativo',
    descripcion: 'Prioridad social referencial del sector (síntesis simulada).',
    utilidad: 'Orienta la inversión hacia barrios con mayores necesidades.',
    cells: vulnerabilidadCells, color: '#C65B50',
  },
  {
    id: 'acceso', nombre: 'Acceso a áreas verdes', unidad: 'déficit relativo',
    descripcion: 'Distancia relativa de la población a áreas verdes existentes.',
    utilidad: 'Prioriza zonas con déficit de acceso a espacios verdes.',
    cells: accesoCells, color: '#E7A44A',
  },
  {
    id: 'trafico', nombre: 'Densidad vehicular', unidad: 'carga relativa',
    descripcion: 'Carga de tránsito estimada en ejes principales.',
    utilidad: 'Condiciona la logística de obras y mantención del corredor.',
    cells: densidadCells.map((c) => ({ ...c, value: Math.min(100, c.value + 10) })), color: '#6a7a86',
  },
];

const ENV_COLORS = ['#B8DCC5', '#7FC49A', '#E7C25A', '#E7A44A', '#D97B4A', '#C65B50'];
const envColor = (v: number) => ENV_COLORS[Math.min(ENV_COLORS.length - 1, Math.floor((v / 100) * ENV_COLORS.length))];

export function TerritorialAnalysisPage() {
  const [selected, setSelected] = useState<IndicatorDef>(INDICATORS[0]);

  const chartData = useMemo(
    () => selected.cells.map((c, i) => ({ zona: `Zona ${i + 1}`, valor: c.value })),
    [selected]
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F5F7F5]">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="bg-[#E7A44A]/10 border border-[#E7A44A]/40 text-[#7a5518] text-xs rounded px-3 py-2 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Indicadores territoriales simulados con fines demostrativos. No constituyen mediciones oficiales ni fuentes institucionales verificadas.
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {INDICATORS.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setSelected(ind)}
              className={cn(
                'text-left rounded border p-3 transition-all',
                selected.id === ind.id ? 'border-[#27865B] bg-white shadow-sm' : 'border-[#dfe5e0] bg-white/60 hover:bg-white'
              )}
            >
              <div className="text-sm font-medium text-[#263238]">{ind.nombre}</div>
              <div className="text-[10px] text-[#8a968e] mt-0.5">{ind.unidad}</div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded border border-[#dfe5e0] p-4">
            <h3 className="font-medium text-[#263238]">{selected.nombre}</h3>
            <p className="text-xs text-[#5b6a62] mt-1.5 leading-relaxed">{selected.descripcion}</p>
            <p className="text-xs text-[#397D91] mt-2 leading-relaxed flex gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {selected.utilidad}
            </p>
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe7" />
                  <XAxis dataKey="zona" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ReTooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="valor" fill={selected.color} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded border border-[#dfe5e0] overflow-hidden relative min-h-[380px]">
            <MapContainer center={[-33.48, -70.63]} zoom={10.5} className="h-full min-h-[380px] z-0" scrollWheelZoom>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selected.cells.map((c) => {
                const color = envColor(c.value);
                return (
                  <Polygon
                    key={c.id}
                    positions={c.latlngs}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.5, weight: 1 }}
                  >
                    <LeafTooltip direction="center" permanent={false}>
                      {selected.nombre}: {c.value} (simulado)
                    </LeafTooltip>
                  </Polygon>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
