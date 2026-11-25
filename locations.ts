export const COMUNAS = [
  'Ñuñoa / La Florida',
  'Santiago / San Joaquín',
  'San Miguel / El Bosque',
  'Macul / Peñalolén',
  'Providencia / Las Condes',
];

export const ORIGEN_OPTIONS = [
  { id: 'parque_san_borja', nombre: 'Parque San Borja' },
  { id: 'parque_ohiggins', nombre: "Parque O'Higgins" },
  { id: 'parque_metropolitano', nombre: 'Parque Metropolitano' },
  { id: 'la_castrina', nombre: 'Parque de La Castrina' },
  { id: 'san_joaquin', nombre: 'Sector verdes San Joaquín' },
];

export const SECTORS: Record<string, string[]> = {
  'Ñuñoa / La Florida': ['Corredor Vicuña Mackenna Sur', 'Eje Grecia – La Florida'],
  'Santiago / San Joaquín': ['Corredor San Borja – San Joaquín', 'Eje Gran Avenida Norte'],
  'San Miguel / El Bosque': ['Corredor Gran Avenida Sur', 'Conexión Lo Ovalle'],
  'Macul / Peñalolén': ['Corredor Vespucio Oriente', 'Eje Macul – La Florida'],
  'Providencia / Las Condes': ['Corredor Andino – Castrina', 'Eje Providencia Oriente'],
};
