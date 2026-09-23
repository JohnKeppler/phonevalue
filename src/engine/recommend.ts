import type {
  Phone,
  PhoneNeeds,
  Recommendation,
  NextIntent,
  UtilizationMap,
  CategoryId,
} from './types'
import { CATEGORIES } from './weights'
import i18n from '../i18n'
import { calculateUtilization } from './calculate'

/** Penalizacion asimetrica: infra-capacidad duele mas que exceso */
export const ALPHA_UNDER = 1.2
export const BETA_OVER = 0.4

/** Margen sobre el uso medido para no quedarse corto. Un poco de holgura esta bien. */
export const NEED_HEADROOM = 1.15

/**
 * Impulso de una intención de compra sobre su categoría.
 * Se aplica solo al ordenar el próximo móvil, nunca al panel del actual.
 */
export const INTENT_BOOST = 1.35

/** Una intención sube la necesidad de la categoría que le corresponde. */
export const INTENT_CATEGORY: Record<NextIntent, keyof PhoneNeeds> = {
  fotos: 'camara',
  video: 'pantalla',
  juegos: 'soc',
  whatsapp: 'conectividad',
  bateria: 'bateria',
  almacenamiento: 'storage',
}

export interface RecommendOptions {
  utilization: UtilizationMap
  intents?: readonly NextIntent[]
  topN?: number
  minPrice?: number
  maxPrice?: number
  includeBrands?: readonly string[]
  excludeBrands?: readonly string[]
}

function intentMultipliers(
  intents: readonly NextIntent[],
): Partial<PhoneNeeds> {
  const mult: Partial<PhoneNeeds> = {}
  for (const intent of intents) {
    const id = INTENT_CATEGORY[intent]
    if (!id) continue
    mult[id] = Math.max(mult[id] ?? 1, INTENT_BOOST)
  }
  return mult
}

/**
 * Convierte utilizacion actual en "necesidades" objetivo.
 * Si usas poco una categoria, no necesitas un telefono top en ella.
 * Las intenciones solo suben la necesidad del próximo móvil.
 */
export function deriveNeeds(
  utilization: UtilizationMap,
  intents: readonly NextIntent[] = [],
): PhoneNeeds {
  const mult = intentMultipliers(intents)
  const needs = {} as PhoneNeeds
  for (const cat of CATEGORIES) {
    const id = cat.id as keyof PhoneNeeds
    const base = clamp(utilization[id] ?? 30, 10, 95)
    const raw = base * NEED_HEADROOM * ((mult[id] as number | undefined) ?? 1)
    needs[id] = clamp(raw, 15, 100)
  }
  return needs
}

/**
 * Cuánto de la capacidad del catálogo usaría esta persona (0–100).
 * Necesidad de uso (con margen, sin intenciones) frente a la capacidad del candidato.
 * Si el teléfono se queda corto, la categoría se aprovecha al 100 %.
 */
export function candidateCategoryUtilization(
  utilization: UtilizationMap,
  capabilities: PhoneNeeds,
): Record<CategoryId, number> {
  const needs = deriveNeeds(utilization, [])
  const out = {} as Record<CategoryId, number>
  for (const cat of CATEGORIES) {
    const id = cat.id
    const cap = capabilities[id]
    const need = needs[id]
    if (!(cap > 0)) {
      out[id] = 100
    } else {
      out[id] = clamp(Math.round((need / cap) * 100), 0, 100)
    }
  }
  return out
}

/**
 * Euros de ESTE precio que se quedarían sin aprovechar dado el uso medido.
 * Misma fórmula del panel (€ asignados × (1 − u)), con u = necesidad / capacidad.
 */
export function candidateWastedEuro(
  priceEuro: number,
  utilization: UtilizationMap,
  capabilities: PhoneNeeds,
): number {
  const u = candidateCategoryUtilization(utilization, capabilities)
  return calculateUtilization(priceEuro, u).totalWastedEuro
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
  const maxDist = weightSum * ALPHA_UNDER * 100
  return total / maxDist
}

export function scoreFit(distance: number): number {
  return round2(clamp(100 * (1 - distance), 0, 100))
}

export function recommendPhones(
  catalog: Phone[],
  options: RecommendOptions,
): Recommendation[] {
  const intents = options.intents ?? []
  const needs = deriveNeeds(options.utilization, intents)
  const topN = options.topN ?? 10
  const include = (options.includeBrands ?? []).filter((b) => b.length > 0)
  const exclude = new Set(options.excludeBrands ?? [])
  const minPrice = options.minPrice
  const maxPrice = options.maxPrice

  const filtered = catalog.filter((phone) => {
    if (minPrice != null && phone.priceEuro < minPrice) return false
    if (maxPrice != null && phone.priceEuro > maxPrice) return false
    if (include.length > 0 && !include.includes(phone.brand)) return false
    if (exclude.has(phone.brand)) return false
    return true
  })

  const reference =
    maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : undefined

  const scored = filtered.map((phone) => {
    const dist = fitDistance(needs, phone.capabilities)
    const fitScore = scoreFit(dist)
    const estimatedSavings = round2(
      reference != null ? Math.max(0, reference - phone.priceEuro) : 0,
    )
    const reasons = buildReasons(phone, needs, intents)
    const fitLabel = labelForFit(fitScore)
    return { phone, fitScore, estimatedSavings, reasons, fitLabel }
  })

  scored.sort((a, b) => {
    // El fit manda: una intención solo mueve una categoría y no debe
    // quedar tapada por una banda ancha de empate. El ahorro desempata.
    if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore
    return b.estimatedSavings - a.estimatedSavings
  })

  return scored.slice(0, Math.max(0, topN))
}

function buildReasons(
  phone: Phone,
  needs: PhoneNeeds,
  intents: readonly NextIntent[],
): string[] {
  const reasons: string[] = []
  const caps = phone.capabilities

  for (const intent of intents) {
    const line = reasonForIntent(intent, caps, needs)
    if (line) reasons.push(line)
  }

  const gaps: { id: CategoryId; label: string; over: number }[] = []
  for (const cat of CATEGORIES) {
    const id = cat.id as CategoryId
    const over = caps[id as keyof PhoneNeeds] - needs[id as keyof PhoneNeeds]
    const label = i18n.t(`categories.${id}.label`, { defaultValue: cat.label })
    gaps.push({ id, label, over })
  }

  const best = [...gaps].sort((a, b) => Math.abs(a.over) - Math.abs(b.over))[0]
  if (best) {
    reasons.push(
      i18n.t('reasons.goodFit', {
        label: best.label.toLowerCase(),
      }),
    )
  }

  if (caps.bateria >= needs.bateria) {
    reasons.push(i18n.t('reasons.batteryOk'))
  }
  if (caps.soc >= needs.soc && caps.ram >= needs.ram) {
    reasons.push(i18n.t('reasons.perfOk'))
  }

  for (const h of phone.highlights.slice(0, 1)) {
    reasons.push(h)
  }

  return [...new Set(reasons)].slice(0, 3)
}

function reasonForIntent(
  intent: NextIntent,
  caps: PhoneNeeds,
  needs: PhoneNeeds,
): string | null {
  switch (intent) {
    case 'fotos':
      return caps.camara >= needs.camara ? i18n.t('reasons.fotos') : null
    case 'video':
      return caps.pantalla >= needs.pantalla ? i18n.t('reasons.video') : null
    case 'juegos':
      return caps.soc >= needs.soc ? i18n.t('reasons.juegos') : null
    case 'whatsapp':
      return caps.conectividad >= needs.conectividad
        ? i18n.t('reasons.whatsapp')
        : null
    case 'bateria':
      return caps.bateria >= needs.bateria ? i18n.t('reasons.bateria') : null
    case 'almacenamiento':
      return caps.storage >= needs.storage
        ? i18n.t('reasons.almacenamiento')
        : null
    default:
      return null
  }
}

function labelForFit(score: number): string {
  if (score >= 85) return i18n.t('fit.excellent')
  if (score >= 70) return i18n.t('fit.veryGood')
  if (score >= 55) return i18n.t('fit.good')
  return i18n.t('fit.ok')
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
