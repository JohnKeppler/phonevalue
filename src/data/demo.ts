import type { UserProfile, UtilizationMap } from '../engine/types'

/** Perfil demo: P=1000€ → ~310€ usados / ~690€ desperdiciados / ~31% */
export const DEMO_UTILIZATION: UtilizationMap = {
  soc: 25,
  pantalla: 40,
  camara: 20,
  storage: 35,
  ram: 30,
  bateria: 45,
  conectividad: 25,
  audio: 15,
  sensores: 20,
  software: 50,
}

export const DEMO_PROFILE: UserProfile = {
  purchasePrice: 1000,
  nextBudget: 450,
  usageType: 'equilibrado',
  utilization: DEMO_UTILIZATION,
}

export const USAGE_LABELS = {
  ligero: 'Ligero',
  equilibrado: 'Equilibrado',
  'gaming-foto': 'Gaming / Foto',
} as const

export const USAGE_HINTS = {
  ligero: 'Llamadas, redes y poco mas',
  equilibrado: 'Uso diario variado',
  'gaming-foto': 'Juegos exigentes o fotografia',
} as const
