import type { CriterionDef } from '@/index';

/**
 * Transformación de resistencia definida por criterio.
 * - 'beneficio': a mayor valor, menor resistencia (r = 100 - v)
 * - 'resistencia': a mayor valor, mayor resistencia (r = v)
 * - 'oportunidad': el déficit u oportunidad concentra la intervención (r = 100 - v)
 */
export const CRITERIA: CriterionDef[] = [
  {
    id: 'conectividad',
    nombre: 'Conectividad ecológica',
    descripcion: 'Proximidad y articulación con nodos naturales y áreas verdes existentes.',
    icono: 'Network',
    polarity: 'beneficio',
    nota: 'Beneficio: mayor conectividad reduce la resistencia del tramo.',
  },
  {
    id: 'temperatura',
    nombre: 'Temperatura superficial',
    descripcion: 'Intensidad de islas de calor urbanas en el entorno del tramo.',
    icono: 'ThermometerSun',
    polarity: 'oportunidad',
    nota: 'Oportunidad: mayor temperatura marca prioridad de intervención, sujeta a exposición y viabilidad.',
  },
  {
    id: 'humedad',
    nombre: 'Humedad e infiltración',
    descripcion: 'Capacidad estimada del suelo para infiltrar y retener agua.',
    icono: 'Droplets',
    polarity: 'beneficio',
    nota: 'Beneficio: mayor infiltración favorece el establecimiento vegetal.',
  },
  {
    id: 'inundacion',
    nombre: 'Riesgo de inundación y escorrentía',
    descripcion: 'Propensión del sector a acumulación de agua y escorrentía urbana.',
    icono: 'Waves',
    polarity: 'resistencia',
    nota: 'Resistencia: mayor riesgo hídrico eleva el costo del tramo.',
  },
  {
    id: 'vegetacion',
    nombre: 'Cobertura vegetal existente',
    descripcion: 'Continuidad de vegetación que el corredor puede reforzar.',
    icono: 'Trees',
    polarity: 'beneficio',
    nota: 'Beneficio: mayor cobertura existente facilita la conexión.',
  },
  {
    id: 'bandejon',
    nombre: 'Ancho y disponibilidad del bandejón',
    descripcion: 'Espacio físico disponible en el bandejón central para plantación.',
    icono: 'Ruler',
    polarity: 'beneficio',
    nota: 'Beneficio: mayor ancho disponible reduce la resistencia.',
  },
  {
    id: 'trafico',
    nombre: 'Densidad vehicular y seguridad',
    descripcion: 'Carga de tránsito y complejidad de instalación y mantención.',
    icono: 'CarFront',
    polarity: 'resistencia',
    nota: 'Resistencia: mayor tránsito complica obras y mantención.',
  },
  {
    id: 'densidad',
    nombre: 'Densidad poblacional',
    descripcion: 'Población residente que se beneficiaría del corredor.',
    icono: 'Users',
    polarity: 'beneficio',
    nota: 'Beneficio: mayor densidad amplifica el beneficio social.',
  },
  {
    id: 'vulnerabilidad',
    nombre: 'Vulnerabilidad social',
    descripcion: 'Índice referencial de prioridad social del sector.',
    icono: 'HeartHandshake',
    polarity: 'beneficio',
    nota: 'Beneficio social: prioriza sectores con mayores necesidades.',
  },
  {
    id: 'acceso',
    nombre: 'Acceso a áreas verdes',
    descripcion: 'Distancia de la población a áreas verdes existentes.',
    icono: 'Footprints',
    polarity: 'oportunidad',
    nota: 'Oportunidad: menor acceso actual aumenta la prioridad del tramo.',
  },
  {
    id: 'costoImpl',
    nombre: 'Costo de implementación',
    descripcion: 'Costo estimado de plantación, riego y obras menores.',
    icono: 'Banknote',
    polarity: 'resistencia',
    nota: 'Resistencia: mayor costo de implementación penaliza el tramo.',
  },
  {
    id: 'costoMant',
    nombre: 'Costo de mantenimiento',
    descripcion: 'Costo anual estimado de riego, reposición y poda.',
    icono: 'Wrench',
    polarity: 'resistencia',
    nota: 'Resistencia: mayor costo de mantención penaliza el tramo.',
  },
];

export const DEFAULT_WEIGHTS: Record<string, number> = {
  conectividad: 90,
  temperatura: 70,
  humedad: 50,
  inundacion: 60,
  vegetacion: 65,
  bandejon: 75,
  trafico: 55,
  densidad: 45,
  vulnerabilidad: 50,
  acceso: 60,
  costoImpl: 40,
  costoMant: 35,
};

export const CRITERIA_BY_ID = Object.fromEntries(CRITERIA.map((c) => [c.id, c]));
