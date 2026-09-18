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
  nextIntents: [],
  utilization: DEMO_UTILIZATION,
}
