import type {
  Phone,
  PhoneNeeds,
  Recommendation,
  UsageType,
  UtilizationMap,
  CategoryId,
} from './types'
import { CATEGORIES } from './weights'

/** Penalizacion asimetrica: infra-capacidad duele mas que exceso */
export const ALPHA_UNDER = 1.2
export const BETA_OVER = 0.4

const USAGE_NEED_MULTIPLIER: Record<UsageType, Partial<PhoneNeeds>> = {
  ligero: {
    soc: 0.7,
    pantalla: 0.75,
    camara: 0.6,
    ram: 0.7,
    bateria: 0.9,
  },
  equilibrado: {},
  'gaming-foto': {
    soc: 1.35,
    pantalla: 1.2,
    camara: 1.4,
    ram: 1.25,
    bateria: 1.15,
    storage: 1.1,
  },
}

/**
 * Convierte utilizacion actual en "necesidades" objetivo.
 * Si usas poco una categoria, no necesitas un telefono top en ella.
 */
export function deriveNeeds(
  utilization: UtilizationMap,
  usageType: UsageType,
): PhoneNeeds {
  const mult = USAGE_NEED_MULTIPLIER[usageType]
  const needs = {} as PhoneNeeds
  for (const cat of CATEGORIES) {
    const id = cat.id as keyof PhoneNeeds
    const base = clamp(utilization[id] ?? 30, 10, 95)
    // Necesidad un poco por encima del uso actual (margen de confort)
    const raw = base * 1.15 * ((mult[id] as number | undefined) ?? 1)
    needs[id] = clamp(raw, 15, 100)
  }
  return needs
}

/**
 * Distancia ponderada con penalizacion asimetrica.
 * Menor distance = mejor fit. Fit score 0–100 (mayor = mejor).
 */
export function fitDistance(
  needs: PhoneNeeds,
  capabilities: PhoneNeeds,
): number {
  let total = 0
  let weightSum = 0
  for (const cat of CATEGORIES) {
    const id = cat.id as keyof PhoneNeeds
    const need = needs[id]
    const cap = capabilities[id]
    const diff = cap - need
    const penalty = diff < 0 ? ALPHA_UNDER : BETA_OVER
    total += cat.weight * penalty * Math.abs(diff)
    weightSum += cat.weight
  }
  // Normalizar: distancia maxima teorica ~ weightSum * alpha * 100
  const maxDist = weightSum * ALPHA_UNDER * 100
  return total / maxDist
}

export function scoreFit(distance: number): number {
  return round2(clamp(100 * (1 - distance), 0, 100))
}

export function recommendPhones(
  catalog: Phone[],
  nextBudget: number,
  utilization: UtilizationMap,
  usageType: UsageType,
  topN = 3,
): Recommendation[] {
  const needs = deriveNeeds(utilization, usageType)

  // Filtro duro: precio <= presupuesto (+ 5% margen) y capacidad minima en categorias criticas
  const filtered = catalog.filter((phone) => {
    if (phone.priceEuro > nextBudget * 1.05) return false
    if (usageType === 'gaming-foto') {
      if (phone.capabilities.soc < 55 || phone.capabilities.camara < 50) return false
    }
    if (usageType === 'ligero') {
      // Evitar flagships caros poco justificados: ya filtrado por presupuesto
      return true
    }
    return true
  })

  const scored = filtered.map((phone) => {
    const dist = fitDistance(needs, phone.capabilities)
    const fitScore = scoreFit(dist)
    const estimatedSavings = round2(
      Math.max(0, /* precio referencia implícito vía presupuesto */ nextBudget - phone.priceEuro),
    )
    const reasons = buildReasons(phone, needs, usageType)
    const fitLabel = labelForFit(fitScore)
    return { phone, fitScore, estimatedSavings, reasons, fitLabel }
  })

  scored.sort((a, b) => {
    // Priorizar fit, luego ahorro
    if (Math.abs(a.fitScore - b.fitScore) > 3) return b.fitScore - a.fitScore
    return b.estimatedSavings - a.estimatedSavings
  })

  return scored.slice(0, topN)
}

function buildReasons(
  phone: Phone,
  needs: PhoneNeeds,
  usageType: UsageType,
): string[] {
  const reasons: string[] = []
  const caps = phone.capabilities

  const gaps: { id: CategoryId; label: string; over: number }[] = []
  for (const cat of CATEGORIES) {
    const id = cat.id as CategoryId
    const over = caps[id as keyof PhoneNeeds] - needs[id as keyof PhoneNeeds]
    gaps.push({ id, label: cat.label, over })
  }
  gaps.sort((a, b) => a.over - b.over)

  // Mejor ajuste (menor exceso/defecto)
  const best = [...gaps].sort((a, b) => Math.abs(a.over) - Math.abs(b.over))[0]
  if (best) {
    reasons.push(`Buen ajuste en ${best.label.toLowerCase()}`)
  }

  if (caps.bateria >= needs.bateria) {
    reasons.push('Autonomia suficiente para tu ritmo diario')
  }
  if (usageType === 'gaming-foto' && caps.camara >= 70) {
    reasons.push('Camara lista para foto y video exigentes')
  }
  if (usageType === 'ligero' && phone.priceEuro < 400) {
    reasons.push('Precio contenido sin pagar por hardware que no usarias')
  }
  if (caps.soc >= needs.soc && caps.ram >= needs.ram) {
    reasons.push('Rendimiento acorde a tus apps habituales')
  }

  for (const h of phone.highlights.slice(0, 1)) {
    reasons.push(h)
  }

  return [...new Set(reasons)].slice(0, 3)
}

function labelForFit(score: number): string {
  if (score >= 85) return 'Encaje excelente'
  if (score >= 70) return 'Muy buen encaje'
  if (score >= 55) return 'Buen encaje'
  return 'Encaje aceptable'
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
