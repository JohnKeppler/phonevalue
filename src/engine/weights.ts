import type { CategoryId, CategoryMeta, BadgeKind } from './types'

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'soc',
    label: 'Procesador (SoC)',
    weight: 16,
    howCalculated:
      'Se estima a partir de la carga de CPU/GPU típica del perfil de uso. En Android real se usaria UsageStats y muestreo de rendimiento.',
  },
  {
    id: 'pantalla',
    label: 'Pantalla',
    weight: 18,
    howCalculated:
      'Basado en horas de pantalla, brillo medio y tasa de refresco usada. Un panel 120 Hz poco aprovechado queda desperdiciado.',
  },
  {
    id: 'camara',
    label: 'Cámara',
    weight: 18,
    howCalculated:
      'Frecuencia de fotos/video y modos avanzados usados. Sensores extras sin uso quedan desperdiciados.',
  },
  {
    id: 'storage',
    label: 'Almacenamiento',
    weight: 8,
    howCalculated:
      'Espacio ocupado vs capacidad usable (como en Ajustes). Mucho almacenamiento vacío = euros desaprovechados.',
  },
  {
    id: 'ram',
    label: 'Memoria RAM',
    weight: 8,
    howCalculated:
      'Picos y media de RAM en uso frente a la capacidad instalada.',
  },
  {
    id: 'bateria',
    label: 'Batería y carga',
    weight: 12,
    howCalculated:
      'Ciclos diarios, autonomía real y uso de carga rapida/inalambrica.',
  },
  {
    id: 'conectividad',
    label: 'Conectividad',
    weight: 6,
    howCalculated:
      'Uso de 5G, Wi-Fi 6/7, NFC y Bluetooth. Bandas premium sin uso penalizan.',
  },
  {
    id: 'audio',
    label: 'Audio',
    weight: 4,
    howCalculated:
      'Reproduccion multimedia, altavoces estereo y micrófonos usados en llamadas/grabación.',
  },
  {
    id: 'sensores',
    label: 'Sensores y pagos',
    weight: 5,
    howCalculated:
      'Huella, Face ID, NFC pagos, brujula, giroscopio y sensores de salud.',
  },
  {
    id: 'software',
    label: 'Software y marca',
    weight: 5,
    howCalculated:
      'Valor percibido de actualizaciones, ecosistema y extras de marca vs uso real.',
  },
]

export const WEIGHT_SUM = CATEGORIES.reduce((s, c) => s + c.weight, 0)

/** Categorias "medidas" en el demo vs estimadas */
export const DEMO_BADGES: Record<CategoryId, BadgeKind> = {
  soc: 'estimado',
  pantalla: 'medido',
  camara: 'medido',
  storage: 'medido',
  ram: 'estimado',
  bateria: 'medido',
  conectividad: 'estimado',
  audio: 'estimado',
  sensores: 'estimado',
  software: 'estimado',
}

export function getCategory(id: CategoryId): CategoryMeta {
  const cat = CATEGORIES.find((c) => c.id === id)
  if (!cat) throw new Error(`Categoria desconocida: ${id}`)
  return cat
}
