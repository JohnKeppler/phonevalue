import type { CategoryId } from './types'

/** Nombre corto para la frase de aprovechamiento (no es un cálculo de desperdicio). */
export const CATEGORY_SHORT: Record<CategoryId, string> = {
  soc: 'Procesador',
  pantalla: 'Pantalla',
  camara: 'Cámara',
  storage: 'Almacenamiento',
  ram: 'RAM',
  bateria: 'Batería',
  conectividad: 'Conectividad',
  audio: 'Audio',
  sensores: 'Sensores',
  software: 'Software',
}

/**
 * Etiqueta concreta a partir de la puntuación 0–100 del catálogo.
 * El catálogo no trae fichas técnicas; el tramo describe el nivel.
 */
export function specLabel(id: CategoryId, score: number): string {
  const s = clamp(score, 0, 100)
  switch (id) {
    case 'soc':
      if (s < 45) return 'chip de entrada'
      if (s < 60) return 'chip de gama media'
      if (s < 75) return 'chip de gama media-alta'
      if (s < 88) return 'chip de gama alta'
      return 'chip flagship'
    case 'pantalla':
      if (s < 50) return 'panel HD'
      if (s < 65) return 'FHD+'
      if (s < 78) return 'AMOLED FHD+ 90 Hz'
      if (s < 88) return 'AMOLED 120 Hz'
      return 'pantalla premium 120 Hz'
    case 'camara':
      if (s < 50) return 'cámara básica'
      if (s < 65) return 'cámara correcta'
      if (s < 80) return 'buena cámara'
      if (s < 90) return 'cámara avanzada'
      return 'cámara de referencia'
    case 'storage':
      if (s < 50) return '128 GB'
      if (s < 65) return '128–256 GB'
      if (s < 80) return '256 GB'
      return '512 GB'
    case 'ram':
      if (s < 50) return '4–6 GB'
      if (s < 62) return '6–8 GB'
      if (s < 75) return '8 GB'
      if (s < 88) return '8–12 GB'
      return '12 GB o más'
    case 'bateria':
      if (s < 50) return 'batería justa'
      if (s < 65) return 'batería correcta, unos 4000 mAh'
      if (s < 78) return 'batería amplia, unos 5000 mAh'
      return 'batería de gran capacidad'
    case 'conectividad':
      if (s < 50) return '4G y Wi-Fi básico'
      if (s < 70) return '5G y Wi-Fi correcto'
      if (s < 85) return '5G y Wi-Fi avanzado'
      return 'conectividad de gama alta'
    case 'audio':
      if (s < 50) return 'altavoz básico'
      if (s < 70) return 'estéreo correcto'
      if (s < 85) return 'buen estéreo'
      return 'audio premium'
    case 'sensores':
      if (s < 50) return 'sensores básicos'
      if (s < 75) return 'huella y NFC'
      return 'sensores avanzados'
    case 'software':
      if (s < 50) return 'soporte corto'
      if (s < 75) return 'varios años de actualizaciones'
      if (s < 90) return 'soporte largo'
      return 'soporte largo y ecosistema'
    default:
      return 'nivel medio'
  }
}

export function usageSentence(
  id: CategoryId,
  capacityScore: number,
  utilizedPct: number,
): string {
  const pct = Math.round(clamp(utilizedPct, 0, 100))
  return `${CATEGORY_SHORT[id]} (${specLabel(id, capacityScore)}): según tu uso aprovecharías un ${pct} %.`
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
