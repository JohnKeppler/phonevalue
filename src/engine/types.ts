/** Claves de categorías de hardware/funciones */
export type CategoryId =
  | 'soc'
  | 'pantalla'
  | 'camara'
  | 'storage'
  | 'ram'
  | 'bateria'
  | 'conectividad'
  | 'audio'
  | 'sensores'
  | 'software'

/**
 * Intención de uso del PRÓXIMO móvil (varias a la vez).
 * No describe el teléfono actual ni entra en el panel de aprovechamiento.
 */
export type NextIntent =
  | 'fotos'
  | 'video'
  | 'juegos'
  | 'whatsapp'
  | 'bateria'
  | 'almacenamiento'

export type BadgeKind = 'medido' | 'estimado'

export type DataSource = 'demo' | 'synthetic' | 'measured'

export interface CategoryMeta {
  id: CategoryId
  label: string
  weight: number // porcentaje 0–100, suma = 100
  howCalculated: string
}

export interface UtilizationMap {
  [key: string]: number // 0–100
}

export interface CategoryResult {
  id: CategoryId
  label: string
  weight: number
  utilization: number
  assignedEuro: number
  usedEuro: number
  wastedEuro: number
  badge: BadgeKind
  howCalculated: string
}

export interface UtilizationResult {
  price: number
  globalS: number
  totalUsedEuro: number
  totalWastedEuro: number
  categories: CategoryResult[]
}

export interface PhoneNeeds {
  soc: number
  pantalla: number
  camara: number
  storage: number
  ram: number
  bateria: number
  conectividad: number
  audio: number
  sensores: number
  software: number
}

export interface Phone {
  id: string
  name: string
  brand: string
  priceEuro: number
  /** Capacidades relativas 0–100 por categoría */
  capabilities: PhoneNeeds
  highlights: string[]
}

export interface UserProfile {
  purchasePrice: number
  nextBudget: number
  /** Qué quiere del próximo móvil. Vacío = solo el uso medido, con margen. */
  nextIntents: NextIntent[]
  utilization: UtilizationMap
  /** Override badges when measured from the device */
  badges?: Partial<Record<CategoryId, BadgeKind>>
  dataSource?: DataSource
  historyDays?: number
  confidenceNote?: string
  /** Raw storage bytes from device (when measured) for UI verification */
  storageUsedBytes?: number
  storageTotalBytes?: number
}

export interface Recommendation {
  phone: Phone
  fitScore: number
  estimatedSavings: number
  reasons: string[]
  fitLabel: string
}
