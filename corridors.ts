
import type { CorridorNode, EjeDef, GraphEdge } from '@/index';

export const EJES: EjeDef[] = [
  // Troncales norte-sur
  {
    id: 'vm',
    nombre: 'Av. Vicuña Mackenna',
    color: '#27865B',
    clase: 'troncal',
    espacio: 'bandejón central',
  },
  {
    id: 'ga',
    nombre: 'Gran Avenida José Miguel Carrera',
    color: '#397D91',
    clase: 'troncal',
    espacio: 'bandejón central',
  },
  {
    id: 'sr',
    nombre: 'Av. Santa Rosa',
    color: '#2E7D4F',
    clase: 'troncal',
    espacio: 'caletera / bandejón',
    notaFactibilidad:
      'Espacio intervenible heterogéneo por tramo; requiere verificación en terreno.',
  },

  // Transversales
  {
    id: 'dep',
    nombre: 'Av. Departamental',
    color: '#5CA97F',
    clase: 'transversal',
    espacio: 'espacio lateral',
    notaFactibilidad:
      'Sin bandejón continuo; interviene antenas y espacios laterales.',
  },
  {
    id: 'lo',
    nombre: 'Av. Lo Ovalle',
    color: '#6a9a86',
    clase: 'transversal',
    espacio: 'espacio lateral',
    notaFactibilidad:
      'Franjas laterales de ancho variable según tramo.',
  },
  {
    id: 'gr',
    nombre: 'Av. Grecia',
    color: '#4CA97B',
    clase: 'transversal',
    espacio: 'caletera / bandejón',
    notaFactibilidad:
      'Caleteras amplias en parte de su trazado; bandejón inexistente.',
  },

  // Metropolitanos y expansión
  {
    id: 'av',
    nombre: 'Av. Américo Vespucio',
    color: '#E7A44A',
    clase: 'expansion',
    espacio: 'bandejón / enlaces',
    notaFactibilidad:
      'Tramos de autopista urbana con enlaces y restricciones de intervención; solo sectores seleccionados con espacio lateral o caletera.',
  },
  {
    id: 'pac',
    nombre: 'Av. Pedro Aguirre Cerda',
    color: '#8a968e',
    clase: 'expansion',
    espacio: 'espacio lateral',
    notaFactibilidad:
      'Eje de expansión sur; espacio intervenible por confirmar.',
  },
  {
    id: 'pj',
    nombre: 'Av. Pajaritos (Los Pajaritos)',
    color: '#a4712c',
    clase: 'expansion',
    espacio: 'antena / caletera',
    notaFactibilidad:
      'Sector poniente con antena y caleteras; factibilidad variable.',
  },
];

export const EJE_BY_ID = Object.fromEntries(
  EJES.map((e) => [e.id, e])
);

/** Coordenadas georreferenciadas coherentes con Santiago (puntos de referencia). */
export const NODES: CorridorNode[] = [
  {
    id: 'parque_metropolitano',
    nombre: 'Parque Metropolitano de Santiago',
    tipo: 'parque',
    comuna: 'Providencia',
    latlng: [-33.422, -70.635],
    descripcion: 'Principal nodo natural del sistema (cerro San Cristóbal).',
  },
  {
    id: 'parque_ohiggins',
    nombre: "Parque O'Higgins",
    tipo: 'parque',
    comuna: 'Santiago',
    latlng: [-33.459, -70.669],
    descripcion: 'Gran parque urbano intermedio, eje de articulación norte-sur.',
  },
  {
    id: 'parque_san_borja',
    nombre: 'Parque San Borja',
    tipo: 'parque',
    comuna: 'Santiago',
    latlng: [-33.455, -70.653],
    descripcion: 'Nodo verde próximo al casco central, cabecera del corredor.',
  },
  {
    id: 'la_castrina',
    nombre: 'Parque de La Castrina',
    tipo: 'parque',
    comuna: 'Las Condes',
    latlng: [-33.403, -70.6],
    descripcion: 'Nodo de borde nororiente (referencial para el eje Vespucio).',
  },
  {
    id: 'san_joaquin',
    nombre: 'Sector verdes San Joaquín',
    tipo: 'nodo',
    comuna: 'San Joaquín',
    latlng: [-33.492, -70.645],
    descripcion: 'Conjunto de áreas verdes de barrio residencial.',
  },
  {
    id: 'la_florida',
    nombre: 'Sector Parque La Florida',
    tipo: 'nodo',
    comuna: 'La Florida',
    latlng: [-33.516, -70.602],
    descripcion: 'Destino sur-oriental del corredor demostrativo.',
  },

  // Intersecciones demostrativas sobre Vicuña Mackenna
  { id: 'vm_1', nombre: 'VM · Plaza Vespucio', tipo: 'interseccion', comuna: 'Providencia', latlng: [-33.437, -70.652] },
  { id: 'vm_2', nombre: 'VM · Ex Caracoles', tipo: 'interseccion', comuna: 'Ñuñoa', latlng: [-33.451, -70.655] },
  { id: 'vm_3', nombre: 'VM · Puente Bulnes', tipo: 'interseccion', comuna: 'Ñuñoa', latlng: [-33.466, -70.658] },
  { id: 'vm_4', nombre: 'VM · Rotonda Grecia', tipo: 'interseccion', comuna: 'Ñuñoa', latlng: [-33.477, -70.66] },
  { id: 'vm_5', nombre: 'VM · Paradero 21', tipo: 'interseccion', comuna: 'San Joaquín', latlng: [-33.489, -70.662] },
  { id: 'vm_6', nombre: 'VM · La Granja', tipo: 'interseccion', comuna: 'La Granja', latlng: [-33.501, -70.664] },
  { id: 'vm_7', nombre: 'VM · Rotonda San Vicente', tipo: 'interseccion', comuna: 'San Joaquín', latlng: [-33.51, -70.664] },

  // Conectores hacia O'Higgins / San Borja
  { id: 'cn_ohiggins_vm', nombre: "Conector O'Higgins–VM", tipo: 'interseccion', comuna: 'Santiago', latlng: [-33.459, -70.663] },
  { id: 'cn_sanborja_ohiggins', nombre: "Conector San Borja–O'Higgins", tipo: 'interseccion', comuna: 'Santiago', latlng: [-33.457, -70.66] },

  // Gran Avenida
  { id: 'ga_1', nombre: 'GA · Estación El Llano', tipo: 'interseccion', comuna: 'San Miguel', latlng: [-33.487, -70.652] },
  { id: 'ga_2', nombre: 'GA · San Fernando', tipo: 'interseccion', comuna: 'San Miguel', latlng: [-33.497, -70.65] },
  { id: 'ga_3', nombre: 'GA · Lo Ovalle', tipo: 'interseccion', comuna: 'El Bosque', latlng: [-33.517, -70.647] },
  { id: 'cn_ga_vm_sj', nombre: 'Conector GA–San Joaquín', tipo: 'interseccion', comuna: 'San Joaquín', latlng: [-33.492, -70.655] },

  // Américo Vespucio
  { id: 'av_1', nombre: 'AV · Las Condes', tipo: 'interseccion', comuna: 'Las Condes', latlng: [-33.405, -70.585] },
  { id: 'av_2', nombre: 'AV · Macul', tipo: 'interseccion', comuna: 'Macul', latlng: [-33.464, -70.601] },
  { id: 'av_3', nombre: 'AV · La Florida Norte', tipo: 'interseccion', comuna: 'La Florida', latlng: [-33.496, -70.603] },
  { id: 'cn_vm_av_macul', nombre: 'Conector VM–AV Macul', tipo: 'interseccion', comuna: 'Macul', latlng: [-33.468, -70.625] },
  { id: 'cn_av_florida', nombre: 'Conector AV–La Florida', tipo: 'interseccion', comuna: 'La Florida', latlng: [-33.507, -70.603] },

  // Santa Rosa
  { id: 'sr_1', nombre: 'SR · Villa Frei', eje: 'sr', tipo: 'interseccion', comuna: 'Ñuñoa', latlng: [-33.458, -70.639] },
  { id: 'sr_2', nombre: 'SR · Estación Ñuble', eje: 'sr', tipo: 'interseccion', comuna: 'San Joaquín', latlng: [-33.472, -70.641] },
  { id: 'sr_3', nombre: 'SR · Rodrigo de Araya', eje: 'sr', tipo: 'interseccion', comuna: 'San Joaquín', latlng: [-33.486, -70.643] },
  { id: 'sr_4', nombre: 'SR · Rotonda Santa Rosa', eje: 'sr', tipo: 'interseccion', comuna: 'La Granja', latlng: [-33.503, -70.645] },
  { id: 'sr_5', nombre: 'SR · San Bernardo Norte', eje: 'sr', tipo: 'interseccion', comuna: 'El Bosque', latlng: [-33.523, -70.647] },

  // Departamental
  { id: 'dep_1', nombre: 'DEP · Salida Vespucio', eje: 'dep', tipo: 'interseccion', comuna: 'La Florida', latlng: [-33.512, -70.608] },
  { id: 'dep_2', nombre: 'DEP · Crucero La Granja', eje: 'dep', tipo: 'interseccion', comuna: 'La Granja', latlng: [-33.513, -70.63] },
  { id: 'dep_3', nombre: 'DEP · San Vicente', eje: 'dep', tipo: 'interseccion', comuna: 'San Joaquín', latlng: [-33.513, -70.648] },
  { id: 'dep_4', nombre: 'DEP · Cerró Rural', eje: 'dep', tipo: 'interseccion', comuna: 'Cerrillos', latlng: [-33.508, -70.692] },

  // Lo Ovalle
  { id: 'lo_1', nombre: 'LO · El Bosque Oriente', eje: 'lo', tipo: 'interseccion', comuna: 'El Bosque', latlng: [-33.535, -70.635] },
  { id: 'lo_2', nombre: 'LO · Cruce Gran Avenida', eje: 'lo', tipo: 'interseccion', comuna: 'El Bosque', latlng: [-33.535, -70.651] },
  { id: 'lo_3', nombre: 'LO · Lo Ovalle Poniente', eje: 'lo', tipo: 'interseccion', comuna: 'San Bernardo', latlng: [-33.536, -70.668] },

  // Grecia
  { id: 'gr_1', nombre: 'GR · Estadio Nacional', eje: 'gr', tipo: 'interseccion', comuna: 'Ñuñoa', latlng: [-33.463, -70.626] },
  { id: 'gr_2', nombre: 'GR · Rotonda Grecia', eje: 'gr', tipo: 'interseccion', comuna: 'Ñuñoa', latlng: [-33.477, -70.62] },
  { id: 'gr_3', nombre: 'GR · Macul Oriente', eje: 'gr', tipo: 'interseccion', comuna: 'Macul', latlng: [-33.482, -70.61] },

  // Pedro Aguirre Cerda
  { id: 'pac_1', nombre: 'PAC · San Miguel Norte', eje: 'pac', tipo: 'interseccion', comuna: 'San Miguel', latlng: [-33.496, -70.655] },
  { id: 'pac_2', nombre: 'PAC · San Bernardo Norte', eje: 'pac', tipo: 'interseccion', comuna: 'San Bernardo', latlng: [-33.515, -70.657] },

  // Pajaritos
  { id: 'pj_1', nombre: 'PJ · Estación Central Norte', eje: 'pj', tipo: 'interseccion', comuna: 'Estación Central', latlng: [-33.456, -70.69] },
  { id: 'pj_2', nombre: 'PJ · Maipú Oriente', eje: 'pj', tipo: 'interseccion', comuna: 'Maipú', latlng: [-33.463, -70.73] },
];

export const NODE_BY_ID: Record<string, CorridorNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n])
);

/** Indicadores de referencia normalizados 0-100 (simulados). */
const ind = (o: Partial<GraphEdge['ind']> = {}): GraphEdge['ind'] => ({
  conectividad: 50,
  temperatura: 50,
  humedad: 50,
  inundacion: 30,
  vegetacion: 40,
  bandejon: 60,
  trafico: 50,
  densidad: 50,
  vulnerabilidad: 50,
  acceso: 50,
  costoImpl: 45,
  costoMant: 45,
  ...o,
});

/** Distancia geodésica aproximada entre dos coordenadas, en kilómetros. */
const km = (a: [number, number], b: [number, number]): number => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

type EdgeSeed = {
  id: string;
  from: string;
  to: string;
  eje: GraphEdge['eje'];
  nombre: string;
  ind: GraphEdge['ind'];
  anchoProm: number;
  via?: [number, number][];
};

const SEEDS: EdgeSeed[] = [
  // Vicuña Mackenna
  { id: 'vm_a', from: 'vm_1', to: 'vm_2', eje: 'vm', nombre: 'Vicuña Mackenna · Plaza Vespucio – Ex Caracoles', anchoProm: 8, ind: ind({ conectividad: 55, temperatura: 62, bandejon: 75, trafico: 68, costoImpl: 42 }) },
  { id: 'vm_b', from: 'vm_2', to: 'vm_3', eje: 'vm', nombre: 'Vicuña Mackenna · Ex Caracoles – Puente Bulnes', anchoProm: 10, ind: ind({ conectividad: 60, temperatura: 65, bandejon: 85, trafico: 70 }) },
  { id: 'vm_c', from: 'vm_3', to: 'vm_4', eje: 'vm', nombre: 'Vicuña Mackenna · Puente Bulnes – Rotonda Grecia', anchoProm: 9, ind: ind({ conectividad: 58, temperatura: 68, inundacion: 35, bandejon: 80, trafico: 66 }) },
  { id: 'vm_d', from: 'vm_4', to: 'vm_5', eje: 'vm', nombre: 'Vicuña Mackenna · Rotonda Grecia – Paradero 21', anchoProm: 7, ind: ind({ conectividad: 55, temperatura: 72, inundacion: 38, bandejon: 62, trafico: 72, vulnerabilidad: 62 }) },
  { id: 'vm_e', from: 'vm_5', to: 'vm_6', eje: 'vm', nombre: 'Vicuña Mackenna · Paradero 21 – La Granja', anchoProm: 6, ind: ind({ conectividad: 50, temperatura: 76, inundacion: 45, bandejon: 55, trafico: 70, densidad: 72, vulnerabilidad: 70, acceso: 72, costoMant: 52 }) },
  { id: 'vm_f', from: 'vm_6', to: 'vm_7', eje: 'vm', nombre: 'Vicuña Mackenna · La Granja – San Vicente', anchoProm: 6, ind: ind({ conectividad: 48, temperatura: 78, inundacion: 48, bandejon: 52, trafico: 68, densidad: 74, vulnerabilidad: 72, acceso: 74, costoMant: 54 }) },
  { id: 'vm_g', from: 'vm_7', to: 'la_florida', eje: 'vm', nombre: 'Vicuña Mackenna · San Vicente – La Florida', anchoProm: 7, ind: ind({ conectividad: 62, temperatura: 74, inundacion: 42, vegetacion: 55, bandejon: 65, trafico: 60, acceso: 66 }) },

  // Conectores norte
  { id: 'cn_sb_oh', from: 'parque_san_borja', to: 'cn_sanborja_ohiggins', eje: 'conector', nombre: 'Conector Parque San Borja', anchoProm: 5, ind: ind({ conectividad: 70, temperatura: 60, vegetacion: 65, trafico: 55, acceso: 40 }) },
  { id: 'cn_oh_link', from: 'cn_sanborja_ohiggins', to: 'parque_ohiggins', eje: 'conector', nombre: "Conector San Borja – O'Higgins", anchoProm: 6, ind: ind({ conectividad: 75, temperatura: 58, vegetacion: 70, trafico: 60, acceso: 35 }) },
  { id: 'cn_oh_vm', from: 'parque_ohiggins', to: 'cn_ohiggins_vm', eje: 'conector', nombre: "Conector O'Higgins – VM", anchoProm: 6, ind: ind({ conectividad: 72, temperatura: 60, vegetacion: 66, trafico: 62 }) },
  { id: 'cn_vm_start', from: 'cn_ohiggins_vm', to: 'vm_1', eje: 'conector', nombre: 'Enlace Vicuña Mackenna Norte', anchoProm: 7, ind: ind({ conectividad: 65, temperatura: 62, vegetacion: 55, trafico: 70, bandejon: 70 }) },

  // Alternativa Gran Avenida
  { id: 'cn_vm_sj', from: 'vm_5', to: 'cn_ga_vm_sj', eje: 'conector', nombre: 'Enlace VM – Gran Avenida (San Joaquín)', anchoProm: 5, ind: ind({ conectividad: 60, temperatura: 70, inundacion: 40, trafico: 65, vulnerabilidad: 68 }) },
  { id: 'cn_sj_ga', from: 'cn_ga_vm_sj', to: 'san_joaquin', eje: 'conector', nombre: 'Enlace San Joaquín verdes', anchoProm: 5, ind: ind({ conectividad: 64, vegetacion: 58, temperatura: 68, acceso: 60 }) },
  { id: 'cn_sj_ga2', from: 'san_joaquin', to: 'ga_1', eje: 'conector', nombre: 'Enlace San Joaquín – GA El Llano', anchoProm: 5, ind: ind({ conectividad: 62, temperatura: 70, trafico: 60, acceso: 62 }) },
  { id: 'ga_a', from: 'ga_1', to: 'ga_2', eje: 'ga', nombre: 'Gran Avenida · El Llano – San Fernando', anchoProm: 8, ind: ind({ conectividad: 52, temperatura: 74, inundacion: 42, bandejon: 78, trafico: 74, densidad: 70, vulnerabilidad: 66 }) },
  { id: 'ga_b', from: 'ga_2', to: 'ga_3', eje: 'ga', nombre: 'Gran Avenida · San Fernando – Lo Ovalle', anchoProm: 7, ind: ind({ conectividad: 50, temperatura: 76, inundacion: 46, bandejon: 70, trafico: 72, densidad: 72, vulnerabilidad: 70, acceso: 70 }) },
  { id: 'cn_ga_fl', from: 'ga_3', to: 'la_florida', eje: 'conector', nombre: 'Enlace Lo Ovalle – La Florida', anchoProm: 6, ind: ind({ conectividad: 58, temperatura: 74, inundacion: 44, trafico: 62, acceso: 64 }) },

  // Alternativa Américo Vespucio
  { id: 'cn_vm_macul', from: 'vm_3', to: 'cn_vm_av_macul', eje: 'conector', nombre: 'Enlace VM – Vespucio (Macul)', anchoProm: 6, ind: ind({ conectividad: 56, temperatura: 70, inundacion: 40, trafico: 68 }) },
  { id: 'cn_macul_av', from: 'cn_vm_av_macul', to: 'av_2', eje: 'conector', nombre: 'Enlace Macul – AV', anchoProm: 6, ind: ind({ conectividad: 58, temperatura: 72, trafico: 70, acceso: 58 }) },
  { id: 'av_a', from: 'av_2', to: 'av_3', eje: 'av', nombre: 'Américo Vespucio · Macul – La Florida Norte', anchoProm: 9, ind: ind({ conectividad: 60, temperatura: 72, inundacion: 38, bandejon: 82, trafico: 76, densidad: 66, acceso: 62, costoImpl: 52 }) },
  { id: 'av_b', from: 'av_3', to: 'cn_av_florida', eje: 'av', nombre: 'Américo Vespucio · Florida Norte', anchoProm: 8, ind: ind({ conectividad: 62, temperatura: 70, vegetacion: 52, bandejon: 78, trafico: 72 }) },
  { id: 'cn_av_fl', from: 'cn_av_florida', to: 'la_florida', eje: 'conector', nombre: 'Enlace AV – Parque La Florida', anchoProm: 7, ind: ind({ conectividad: 66, vegetacion: 58, temperatura: 68, trafico: 60, acceso: 58 }) },
  { id: 'cn_oh_av', from: 'parque_ohiggins', to: 'av_2', eje: 'conector', nombre: 'Enlace O’Higgins – Vespucio (largo)', anchoProm: 6, ind: ind({ conectividad: 54, temperatura: 68, trafico: 72, costoImpl: 55, costoMant: 52 }) },
  { id: 'cn_sb_av', from: 'parque_san_borja', to: 'vm_1', eje: 'conector', nombre: 'Enlace directo San Borja – VM Norte', anchoProm: 6, ind: ind({ conectividad: 66, temperatura: 62, vegetacion: 58, trafico: 64, bandejon: 68 }) },

  // Santa Rosa
  { id: 'sr_a', from: 'sr_1', to: 'sr_2', eje: 'sr', nombre: 'Santa Rosa · Villa Frei – Estación Ñuble', anchoProm: 7, ind: ind({ conectividad: 54, temperatura: 70, bandejon: 60, trafico: 74, densidad: 66, vulnerabilidad: 58, acceso: 60 }) },
  { id: 'sr_b', from: 'sr_2', to: 'sr_3', eje: 'sr', nombre: 'Santa Rosa · Ñuble – Rodrigo de Araya', anchoProm: 6, ind: ind({ conectividad: 50, temperatura: 74, inundacion: 42, bandejon: 52, trafico: 72, densidad: 72, vulnerabilidad: 68, acceso: 68, costoMant: 52 }) },
  { id: 'sr_c', from: 'sr_3', to: 'sr_4', eje: 'sr', nombre: 'Santa Rosa · Rodrigo de Araya – Rotonda', anchoProm: 6, ind: ind({ conectividad: 48, temperatura: 76, inundacion: 46, bandejon: 50, trafico: 70, densidad: 74, vulnerabilidad: 72, acceso: 72, costoMant: 54 }) },
  { id: 'sr_d', from: 'sr_4', to: 'sr_5', eje: 'sr', nombre: 'Santa Rosa · Rotonda – San Bernardo Norte', anchoProm: 7, ind: ind({ conectividad: 52, temperatura: 74, inundacion: 44, bandejon: 58, trafico: 66, densidad: 70, vulnerabilidad: 70, acceso: 70 }) },

  // Conectores Santa Rosa
  { id: 'cn_oh_sr', from: 'parque_ohiggins', to: 'sr_1', eje: 'conector', nombre: "Enlace O'Higgins – Santa Rosa", anchoProm: 5, ind: ind({ conectividad: 64, temperatura: 64, vegetacion: 60, trafico: 66 }) },
  { id: 'cn_sr_sj', from: 'sr_2', to: 'san_joaquin', eje: 'conector', nombre: 'Enlace Santa Rosa – San Joaquín', anchoProm: 5, ind: ind({ conectividad: 62, temperatura: 70, vegetacion: 52, acceso: 64 }) },
  { id: 'cn_sr_dep', from: 'sr_4', to: 'dep_2', eje: 'conector', nombre: 'Enlace Santa Rosa – Departamental', anchoProm: 5, ind: ind({ conectividad: 56, temperatura: 74, trafico: 64, acceso: 66 }) },

  // Departamental
  { id: 'dep_a', from: 'dep_1', to: 'dep_2', eje: 'dep', nombre: 'Departamental · Vespucio – La Granja', anchoProm: 5, ind: ind({ conectividad: 52, temperatura: 74, inundacion: 40, bandejon: 45, trafico: 60, densidad: 70, vulnerabilidad: 68, acceso: 70, costoMant: 50 }) },
  { id: 'dep_b', from: 'dep_2', to: 'dep_3', eje: 'dep', nombre: 'Departamental · La Granja – San Vicente', anchoProm: 5, ind: ind({ conectividad: 50, temperatura: 76, inundacion: 44, bandejon: 42, trafico: 62, densidad: 72, vulnerabilidad: 70, acceso: 72, costoMant: 52 }) },
  { id: 'dep_c', from: 'dep_3', to: 'dep_4', eje: 'dep', nombre: 'Departamental · San Vicente – Cerrillos', anchoProm: 6, ind: ind({ conectividad: 46, temperatura: 78, inundacion: 48, bandejon: 48, trafico: 64, densidad: 68, vulnerabilidad: 72, acceso: 74, costoMant: 54 }) },

  // Conectores Departamental
  { id: 'cn_dep_vm', from: 'dep_2', to: 'vm_7', eje: 'conector', nombre: 'Enlace Departamental – VM Sur', anchoProm: 5, ind: ind({ conectividad: 58, temperatura: 74, trafico: 62, acceso: 66 }) },
  { id: 'cn_dep_ga', from: 'dep_3', to: 'ga_3', eje: 'conector', nombre: 'Enlace Departamental – Gran Avenida', anchoProm: 5, ind: ind({ conectividad: 56, temperatura: 74, trafico: 60, acceso: 64 }) },
  { id: 'cn_dep_fl', from: 'dep_1', to: 'la_florida', eje: 'conector', nombre: 'Enlace Departamental – La Florida', anchoProm: 6, ind: ind({ conectividad: 60, temperatura: 72, vegetacion: 54, trafico: 58, acceso: 60 }) },

  // Lo Ovalle
  { id: 'lo_a', from: 'lo_1', to: 'lo_2', eje: 'lo', nombre: 'Lo Ovalle · El Bosque Oriente – Gran Avenida', anchoProm: 5, ind: ind({ conectividad: 46, temperatura: 78, inundacion: 48, bandejon: 44, trafico: 62, densidad: 74, vulnerabilidad: 74, acceso: 76, costoMant: 54 }) },
  { id: 'lo_b', from: 'lo_2', to: 'lo_3', eje: 'lo', nombre: 'Lo Ovalle · Gran Avenida – Poniente', anchoProm: 5, ind: ind({ conectividad: 44, temperatura: 80, inundacion: 50, bandejon: 42, trafico: 60, densidad: 72, vulnerabilidad: 76, acceso: 78, costoMant: 56 }) },

  // Conectores Lo Ovalle
  { id: 'cn_lo_ga', from: 'lo_2', to: 'ga_3', eje: 'conector', nombre: 'Enlace Lo Ovalle – Gran Avenida', anchoProm: 5, ind: ind({ conectividad: 54, temperatura: 76, trafico: 62, acceso: 68 }) },
  { id: 'cn_lo_sr', from: 'sr_5', to: 'lo_3', eje: 'conector', nombre: 'Enlace Santa Rosa – Lo Ovalle', anchoProm: 5, ind: ind({ conectividad: 50, temperatura: 78, trafico: 62, acceso: 70, vulnerabilidad: 72 }) },

  // Grecia
  { id: 'gr_a', from: 'gr_1', to: 'gr_2', eje: 'gr', nombre: 'Grecia · Estadio Nacional – Rotonda Grecia', anchoProm: 6, ind: ind({ conectividad: 58, temperatura: 64, inundacion: 30, bandejon: 55, trafico: 68, vegetacion: 52, acceso: 50 }) },
  { id: 'gr_b', from: 'gr_2', to: 'gr_3', eje: 'gr', nombre: 'Grecia · Rotonda – Macul Oriente', anchoProm: 6, ind: ind({ conectividad: 54, temperatura: 68, inundacion: 34, bandejon: 52, trafico: 70, densidad: 60, acceso: 54 }) },

  // Conectores Grecia
  { id: 'cn_gr_vm', from: 'gr_2', to: 'vm_4', eje: 'conector', nombre: 'Enlace Grecia – VM (Rotonda)', anchoProm: 5, ind: ind({ conectividad: 66, temperatura: 66, trafico: 68 }) },
  { id: 'cn_gr_av', from: 'gr_3', to: 'av_2', eje: 'conector', nombre: 'Enlace Grecia – Vespucio Macul', anchoProm: 5, ind: ind({ conectividad: 60, temperatura: 70, trafico: 70, acceso: 56 }) },
  { id: 'cn_gr_sb', from: 'parque_san_borja', to: 'gr_1', eje: 'conector', nombre: 'Enlace San Borja – Grecia', anchoProm: 5, ind: ind({ conectividad: 64, temperatura: 62, vegetacion: 58, trafico: 62 }) },

  // Pedro Aguirre Cerda
  { id: 'pac_a', from: 'pac_1', to: 'pac_2', eje: 'pac', nombre: 'Pedro Aguirre Cerda · San Miguel – San Bernardo', anchoProm: 5, ind: ind({ conectividad: 42, temperatura: 80, inundacion: 50, bandejon: 40, trafico: 58, densidad: 70, vulnerabilidad: 76, acceso: 78, costoMant: 56 }) },

  // Conectores Pedro Aguirre Cerda
  { id: 'cn_pac_ga', from: 'pac_1', to: 'ga_2', eje: 'conector', nombre: 'Enlace PAC – Gran Avenida', anchoProm: 5, ind: ind({ conectividad: 52, temperatura: 76, trafico: 60, acceso: 68 }) },
  { id: 'cn_pac_lo', from: 'pac_2', to: 'lo_3', eje: 'conector', nombre: 'Enlace PAC – Lo Ovalle', anchoProm: 5, ind: ind({ conectividad: 48, temperatura: 78, trafico: 58, acceso: 72, vulnerabilidad: 74 }) },

  // Pajaritos
  { id: 'pj_a', from: 'pj_1', to: 'pj_2', eje: 'pj', nombre: 'Pajaritos · Estación Central – Maipú', anchoProm: 6, ind: ind({ conectividad: 40, temperatura: 72, inundacion: 42, bandejon: 48, trafico: 66, densidad: 56, vulnerabilidad: 54, acceso: 58, costoMant: 48 }) },

  // Conectores Pajaritos
  { id: 'cn_pj_oh', from: 'parque_ohiggins', to: 'pj_1', eje: 'conector', nombre: "Enlace O'Higgins – Pajaritos (Alameda)", anchoProm: 6, ind: ind({ conectividad: 58, temperatura: 66, vegetacion: 54, trafico: 72, costoImpl: 50 }) },
  { id: 'cn_pj_av', from: 'pj_1', to: 'dep_4', eje: 'conector', nombre: 'Enlace Pajaritos – Departamental (Cerrillos)', anchoProm: 5, ind: ind({ conectividad: 46, temperatura: 72, trafico: 64, acceso: 60 }) },

  // Conector Vespucio poniente
  { id: 'cn_av_dep', from: 'dep_4', to: 'av_2', eje: 'conector', nombre: 'Enlace Vespucio – Departamental (sur)', anchoProm: 5, ind: ind({ conectividad: 52, temperatura: 74, trafico: 74, acceso: 62, costoImpl: 58, costoMant: 52 }) },
];

export const EDGES: GraphEdge[] = SEEDS.map((s) => {
  const a = NODE_BY_ID[s.from];
  const b = NODE_BY_ID[s.to];

  if (!a || !b) {
    throw new Error(
      `No se puede construir el tramo "${s.id}": nodo inexistente (${s.from} → ${s.to}).`
    );
  }

  const latlngs: [number, number][] = s.via ? [...s.via] : [];

  const path: [number, number][] = [
    [a.latlng[0], a.latlng[1]],
    ...latlngs,
    [b.latlng[0], b.latlng[1]],
  ];

  return {
    id: s.id,
    from: s.from,
    to: s.to,
    eje: s.eje,
    nombre: s.nombre,
    lengthKm: km(a.latlng, b.latlng),
    latlngs: path,
    ind: s.ind,
    anchoProm: s.anchoProm,
  };
});

/** Áreas verdes y parques (geometrías referenciales). */
export const GREEN_AREAS: {
  nombre: string;
  latlng: [number, number];
  radioKm: number;
  color: string;
}[] = [
  { nombre: 'Parque Metropolitano', latlng: [-33.415, -70.638], radioKm: 1.6, color: '#2E7D4F' },
  { nombre: "Parque O'Higgins", latlng: [-33.459, -70.669], radioKm: 0.9, color: '#27865B' },
  { nombre: 'Parque San Borja', latlng: [-33.455, -70.653], radioKm: 0.5, color: '#27865B' },
  { nombre: 'Parque La Castrina', latlng: [-33.403, -70.6], radioKm: 0.8, color: '#2E7D4F' },
  { nombre: 'Parque Inés de Suárez', latlng: [-33.42, -70.615], radioKm: 0.4, color: '#4CA97B' },
  { nombre: 'Parque Bicentenario', latlng: [-33.412, -70.608], radioKm: 0.5, color: '#4CA97B' },
  { nombre: 'Verdes San Joaquín', latlng: [-33.492, -70.645], radioKm: 0.45, color: '#5CA97F' },
  { nombre: 'Parque La Florida', latlng: [-33.516, -70.602], radioKm: 0.55, color: '#27865B' },
  { nombre: 'Parque Portales', latlng: [-33.5, -70.672], radioKm: 0.5, color: '#5CA97F' },
  { nombre: 'Parque Peñalolén', latlng: [-33.482, -70.545], radioKm: 0.7, color: '#4CA97B' },
];

/** Ejes viales de referencia (líneas demostrativas). */
export const AVENIDAS: {
  nombre: string;
  latlngs: [number, number][];
  eje?: string;
}[] = [
  { nombre: 'Vicuña Mackenna', eje: 'vm', latlngs: [[-33.437, -70.652], [-33.451, -70.655], [-33.466, -70.658], [-33.477, -70.66], [-33.489, -70.662], [-33.501, -70.664], [-33.51, -70.664], [-33.516, -70.602]] },
  { nombre: 'Gran Avenida', eje: 'ga', latlngs: [[-33.459, -70.66], [-33.487, -70.652], [-33.497, -70.65], [-33.517, -70.647]] },
  { nombre: 'Américo Vespucio', eje: 'av', latlngs: [[-33.405, -70.585], [-33.464, -70.601], [-33.496, -70.603], [-33.507, -70.603]] },
  { nombre: 'Santa Rosa', eje: 'sr', latlngs: [[-33.458, -70.639], [-33.472, -70.641], [-33.486, -70.643], [-33.503, -70.645], [-33.523, -70.647]] },
  { nombre: 'Departamental', eje: 'dep', latlngs: [[-33.512, -70.608], [-33.513, -70.63], [-33.513, -70.648], [-33.508, -70.692]] },
  { nombre: 'Lo Ovalle', eje: 'lo', latlngs: [[-33.535, -70.635], [-33.535, -70.651], [-33.536, -70.668]] },
  { nombre: 'Grecia', eje: 'gr', latlngs: [[-33.463, -70.626], [-33.477, -70.62], [-33.482, -70.61]] },
  { nombre: 'Pedro Aguirre Cerda', eje: 'pac', latlngs: [[-33.496, -70.655], [-33.515, -70.657]] },
  { nombre: 'Pajaritos', eje: 'pj', latlngs: [[-33.456, -70.69], [-33.463, -70.73]] },
  { nombre: 'Providencia / Apoquindo', latlngs: [[-33.426, -70.618], [-33.415, -70.6], [-33.403, -70.585]] },
  { nombre: 'Alameda', latlngs: [[-33.451, -70.669], [-33.452, -70.653], [-33.453, -70.63]] },
];

/** Celdas rectangulares demostrativas para capas ambientales. */
export interface EnvironmentalCell {
  id: string;
  latlngs: [number, number][];
  value: number;
}
