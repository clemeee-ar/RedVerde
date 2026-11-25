import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer, TileLayer, Polygon, Polyline, Circle, CircleMarker, Marker, Popup, Tooltip as LeafTooltip, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AVENIDAS, EJE_BY_ID, GREEN_AREAS, NODES, NODE_BY_ID } from '@/corridors';
import {
  accesoCells, densidadCells, riesgoHidricoCells, temperaturaCells, vegetacionCells, vulnerabilidadCells,
  type EnvironmentalCell,
} from '@/environmental';

import type { CorridorResult, EjeId, LatLng, SegmentResult } from '@/index';

const ENV_COLORS = ['#B8DCC5', '#7FC49A', '#E7C25A', '#E7A44A', '#D97B4A', '#C65B50'];

function envColor(v: number): string {
  const i = Math.min(ENV_COLORS.length - 1, Math.floor((v / 100) * ENV_COLORS.length));
  return ENV_COLORS[i];
}
const EJE_CLASE_LABEL: Record<string, string> = {
  troncal: 'Eje troncal',
  conector: 'Eje conector',
  metropolitano: 'Eje metropolitano',
  expansion: 'Eje de expansión',
};
export interface MapLayers {
  areasVerdes: boolean;
  nodos: boolean;
  ejes: boolean;
  corredores: boolean;
  temperatura: boolean;
  riesgoHidrico: boolean;
  vegetacion: boolean;
  densidad: boolean;
  vulnerabilidad: boolean;
  acceso: boolean;
}

export const DEFAULT_LAYERS: MapLayers = {
  areasVerdes: true, nodos: true, ejes: true, corredores: true,
  temperatura: false, riesgoHidrico: false, vegetacion: false,
  densidad: false, vulnerabilidad: false, acceso: false,
};

interface Props {
  layers: MapLayers;
  corridors: { optima: CorridorResult | null; alt1: CorridorResult | null; alt2: CorridorResult | null };
  selectedRoute: string | null;
  onSelectRoute: (id: string) => void;
  onSelectSegment: (seg: SegmentResult) => void;
  origen: string;
  destino: string;
  fitKey: number;
  /** activación individual por eje vial (id EjeId -> bool); undefined = todos activos */
  ejesActivos?: Record<string, boolean>;
}

const nodeIcon = (kind: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${
      kind === 'parque' ? '#174D38' : '#397D91'
    };border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

function EnvCells({ cells, opacity = 0.45 }: { cells: EnvironmentalCell[]; opacity?: number }) {
  return (
    <>
      {cells.map((c) => {
        const color = envColor(c.value);
        return (
          <Polygon
            key={c.id}
            positions={c.latlngs}
            pathOptions={{ color, fillColor: color, fillOpacity: opacity, weight: 0.5 }}
          >
            <LeafTooltip direction="center" permanent={false} className="env-tooltip">
              Valor: {c.value} (simulado)
            </LeafTooltip>
          </Polygon>
        );
      })}
    </>
  );
}

export function CorridorMap({ layers, corridors, selectedRoute, onSelectRoute, onSelectSegment, origen, destino, fitKey, ejesActivos }: Props) {
  const center: LatLng = [-33.47, -70.64];

  const allSegments = useMemo(() => {
    const order: Record<string, number> = { alt2: 0, alt1: 1, optima: 2 };
    const segs: { seg: SegmentResult; variant: string; color: string }[] = [];
    for (const [variant, c] of Object.entries(corridors)) {
      if (!c || !layers.corredores) continue;
      for (const s of c.segments) segs.push({ seg: s, variant, color: c.color });
    }
    return segs.sort((a, b) => (order[a.variant] ?? 0) - (order[b.variant] ?? 0));
  }, [corridors, layers.corredores]);

  return (
    <MapContainer center={center} zoom={11} className="h-full w-full z-0" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Capas ambientales simuladas */}
      {layers.temperatura && <EnvCells cells={temperaturaCells} />}
      {layers.riesgoHidrico && <EnvCells cells={riesgoHidricoCells} />}
      {layers.vegetacion && <EnvCells cells={vegetacionCells} />}
      {layers.densidad && <EnvCells cells={densidadCells} />}
      {layers.vulnerabilidad && <EnvCells cells={vulnerabilidadCells} />}
      {layers.acceso && <EnvCells cells={accesoCells} />}

      {/* Áreas verdes */}
      {layers.areasVerdes &&
        GREEN_AREAS.map((g) => (
          <Circle
            key={g.nombre}
            center={g.latlng}
            radius={g.radioKm * 1000}
            pathOptions={{ color: g.color, fillColor: g.color, fillOpacity: 0.25, weight: 1 }}
          >
            <Popup>{g.nombre} — polígono referencial simulado</Popup>
          </Circle>
        ))}

      {/* Avenidas (activables por eje) */}
      {layers.ejes &&
        AVENIDAS.map((a) => {
          if (a.eje && ejesActivos && ejesActivos[a.eje] === false) return null;
          const def = a.eje ? EJE_BY_ID[a.eje as EjeId] : undefined;
          const clase = def?.clase;
          const dash = clase === 'transversal' ? '6 6' : clase === 'expansion' ? '2 8' : a.eje ? undefined : '4 6';
          const weight = clase === 'troncal' ? 4 : clase === 'transversal' ? 3 : clase === 'expansion' ? 3 : 2.5;
          return (
            <Polyline
              key={a.nombre}
              positions={a.latlngs}
              pathOptions={{ color: def?.color ?? '#9aa8a0', weight, opacity: 0.4, dashArray: dash }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{a.nombre}</strong>
                  {def && (
                    <>
                      <br />
                      {EJE_CLASE_LABEL[def.clase]} · Espacio potencial: {def.espacio}
                      {def.notaFactibilidad && <><br /><span className="text-[#a4712c]">{def.notaFactibilidad}</span></>}
                    </>
                  )}
                  <br />
                  <span className="text-[#8a968e]">Trazado demostrativo simulado</span>
                </div>
              </Popup>
            </Polyline>
          );
        })}

      {/* Corredores calculados */}
      {allSegments.map(({ seg, variant, color }) => {
        const selected = selectedRoute === variant;
        const base = seg.eje !== 'conector';
        return (
          <Polyline
            key={seg.edgeId + variant}
            positions={seg.latlngs}
            eventHandlers={{ click: () => { onSelectRoute(variant); onSelectSegment(seg); } }}
            pathOptions={{
              color,
              weight: selected ? (base ? 7 : 5) : base ? 4 : 3,
              opacity: selected ? 0.95 : 0.55,
              lineCap: 'round',
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{seg.nombre}</strong><br />
                Longitud: {seg.lengthKm.toFixed(2)} km · Ancho prom: {seg.anchoProm} m<br />
                Costo ponderado: {seg.costo.toFixed(3)}<br />
                <span className="text-[#a4712c]">Datos simulados</span>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Nodos */}
      {layers.nodos &&
        NODES.map((n) => (
          <Marker key={n.id} position={n.latlng} icon={nodeIcon(n.tipo)}>
            <Popup>
              <div className="text-xs">
                <strong>{n.nombre}</strong><br />
                {n.descripcion || 'Nodo de red demostrativo'}<br />
                Comuna: {n.comuna}
                {n.id === origen && <div className="text-[#27865B] font-medium">Origen del escenario</div>}
                {n.id === destino && <div className="text-[#C65B50] font-medium">Destino del escenario</div>}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Marcadores origen/destino */}
      {origen && NODE_BY_ID[origen] && (
        <CircleMarker center={NODE_BY_ID[origen].latlng} radius={12} pathOptions={{ color: '#174D38', fillOpacity: 0.15 }}>
          <LeafTooltip permanent direction="top">Origen</LeafTooltip>
        </CircleMarker>
      )}
      {destino && NODE_BY_ID[destino] && (
        <CircleMarker center={NODE_BY_ID[destino].latlng} radius={12} pathOptions={{ color: '#C65B50', fillOpacity: 0.15 }}>
          <LeafTooltip permanent direction="top">Destino</LeafTooltip>
        </CircleMarker>
      )}
      <FitHelper fitKey={fitKey} corridors={corridors} />
    </MapContainer>
  );
}

function FitHelper({ fitKey, corridors }: { fitKey: number; corridors: Props['corridors'] }) {
  const map = useMap();
  const [lastFit, setLastFit] = useState(-1);
  useEffect(() => {
    if (lastFit === fitKey) return;
    setLastFit(fitKey);
    const c = corridors.optima;
    if (c && c.segments.length > 0) {
      const pts = c.segments.flatMap((s) => s.latlngs);
      map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
    }
  }, [fitKey, corridors, map, lastFit]);
  return null;
}
