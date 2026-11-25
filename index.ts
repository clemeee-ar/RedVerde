export type LatLng = [number, number];

export type Estrato = 'arbol' | 'arbusto' | 'herbacea';

export type CriterionId =
  | 'conectividad'
  | 'temperatura'
  | 'humedad'
  | 'inundacion'
  | 'vegetacion'
  | 'bandejon'
  | 'trafico'
  | 'densidad'
  | 'vulnerabilidad'
  | 'acceso'
  | 'costoImpl'
  | 'costoMant';

/** Sentido del criterio respecto a la resistencia del corredor */
export type CriterionPolarity = 'beneficio' | 'resistencia' | 'oportunidad';

export interface CriterionDef {
  id: CriterionId;
  nombre: string;
  descripcion: string;
  icono: string; // nombre lucide
  polarity: CriterionPolarity;
  nota: string;
}

export interface CorridorNode {
  id: string;
  nombre: string;
  tipo: 'parque' | 'nodo' | 'interseccion';
  comuna: string;
  latlng: LatLng;
  eje?: EjeId;
  descripcion?: string;
}

export interface EdgeIndicators {
  conectividad: number;
  temperatura: number;
  humedad: number;
  inundacion: number;
  vegetacion: number;
  bandejon: number;
  trafico: number;
  densidad: number;
  vulnerabilidad: number;
  acceso: number;
  costoImpl: number;
  costoMant: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  eje: EjeId | 'conector';
  nombre: string;
  lengthKm: number;
  latlngs: LatLng[];
  /** Indicadores normalizados 0-100, orientados como "resistencia bruta" */
  ind: EdgeIndicators;
  anchoProm: number; // m
}

export type EjeId =
  | 'vm' // Vicuña Mackenna (troncal)
  | 'ga' // Gran Avenida José Miguel Carrera (troncal)
  | 'sr' // Santa Rosa (troncal)
  | 'dep' // Departamental (transversal)
  | 'lo' // Lo Ovalle (transversal)
  | 'gr' // Grecia (transversal)
  | 'av' // Américo Vespucio (metropolitano)
  | 'pac' // Pedro Aguirre Cerda (metropolitano)
  | 'pj'; // Pajaritos (metropolitano)

export type EjeClase = 'troncal' | 'secundario' | 'transversal' | 'expansion';

export interface EjeDef {
  id: EjeId;
  nombre: string;
  color: string;
  clase: EjeClase;
  /** tipo de espacio potencialmente intervenible (referencial) */
  espacio: 'bandejón central' | 'caletera / bandejón' | 'espacio lateral' | 'bandejón / enlaces' | 'antena / caletera';
  notaFactibilidad?: string;
}

export const EJE_CLASE_LABEL: Record<EjeClase, string> = {
  troncal: 'Corredor troncal',
  secundario: 'Corredor secundario',
  transversal: 'Conector transversal',
  expansion: 'Expansión metropolitana',
};

export interface Weights {
  [k: string]: number;
}

export interface SegmentResult {
  edgeId: string;
  nombre: string;
  from: string;
  to: string;
  eje: EjeId | 'conector';
  lengthKm: number;
  anchoProm: number;
  ind: EdgeIndicators;
  costo: number;
  latlngs: LatLng[];
}

export interface CorridorResult {
  id: string;
  etiqueta: string;
  color: string;
  variant: 'optima' | 'alt1' | 'alt2';
  segments: SegmentResult[];
  lengthKm: number;
  costoTotal: number;
  /** media ponderada de indicadores normalizados en el corredor */
  indResumen: EdgeIndicators;
  anchoProm: number;
  /** indicadores "crudos" promedio para gráficos comparativos */
  promInd: EdgeIndicators;
}

export interface Species {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  estrato: Estrato;
  hidrico: 'bajo' | 'medio' | 'alto';
  resistenciaSequia: 'alta' | 'media' | 'baja';
  exposicionSolar: 'pleno sol' | 'sol/semi-sombra' | 'semi-sombra';
  funcionEcologica: string;
  funcionHidrica: string;
  adecuacionUrbana: string;
  /** umbrales demostrativos para recomendación por tramo */
  aptoBandejonEstrecho: boolean;
  toleraContaminacion: boolean;
  fotoUrl?: string;
}

export interface LayerDef {
  id: string;
  nombre: string;
  descripcion: string;
  kind: 'base' | 'nodos' | 'ejes' | 'corredores' | 'ambiental';
  color?: string;
  indicator?: CriterionId | 'ndvi';
  activa?: boolean;
}

export interface UploadedDataset {
  id: string;
  fileName: string;
  kind: 'CSV' | 'GeoJSON';
  tipoInfo: string;
  estado: 'validado' | 'error';
  registros: number;
  mensajes: string[];
  cargadoEn: string;
}

export interface ScenarioState {
  comuna: string;
  sector: string;
  eje: EjeId;
  origen: string;
  destino: string;
  weights: Weights;
}

export interface SegmentRecommendation {
  species: Species;
  justificacion: string;
}
