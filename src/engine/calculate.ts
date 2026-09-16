import { CATEGORIES, DEMO_BADGES } from './weights'
import type {
  BadgeKind,
  CategoryId,
  CategoryResult,
  UtilizationMap,
  UtilizationResult,
} from './types'

/**
 * Calcula aprovechamiento de valor del telefono.
 *
 * €_asignados = P * (w / 100)
 * €_aprov = asignados * (u / 100)
 * desperd = asignados - aprov
 * S = 100 * sum(aprov) / P
 */
export function calculateUtilization(
  price: number,
  utilization: UtilizationMap,
  badgeOverrides?: Partial<Record<CategoryId, BadgeKind>>,
): UtilizationResult {
  if (price <= 0) {
    throw new Error('El precio debe ser positivo')
  }

  const categories: CategoryResult[] = CATEGORIES.map((meta) => {
    const u = clamp(utilization[meta.id] ?? 0, 0, 100)
    const assignedEuro = (price * meta.weight) / 100
    const usedEuro = (assignedEuro * u) / 100
    const wastedEuro = assignedEuro - usedEuro
    const badge =
      badgeOverrides?.[meta.id as CategoryId] ??
      DEMO_BADGES[meta.id as CategoryId]
    return {
      id: meta.id,
      label: meta.label,
      weight: meta.weight,
      utilization: u,
      assignedEuro: round2(assignedEuro),
      usedEuro: round2(usedEuro),
      wastedEuro: round2(wastedEuro),
      badge,
      howCalculated: meta.howCalculated,
    }
  })

  const totalUsedEuro = round2(categories.reduce((s, c) => s + c.usedEuro, 0))
  const totalWastedEuro = round2(price - totalUsedEuro)
  const globalS = round2((100 * totalUsedEuro) / price)

  return {
    price,
    globalS,
    totalUsedEuro,
    totalWastedEuro,
    categories,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
