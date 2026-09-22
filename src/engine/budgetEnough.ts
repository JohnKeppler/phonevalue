import type { NextIntent, Phone, UtilizationMap } from './types'
import { deriveNeeds, fitDistance, scoreFit } from './recommend'

export interface BudgetBand {
  /** Precio orientativo que ya encaja con el uso (~X €) */
  enoughEuro: number
  /** Por encima de este precio casi no mejora el encaje (~Y €) */
  littleGainAbove: number
}

/**
 * Heurística: frontera precio→mejor fit acumulado.
 * X = móvil más barato con fit ≥ 70 (o el primero de la frontera).
 * Y = precio en el que el fit ya está a ≤5 puntos del máximo del catálogo.
 */
export function deriveBudgetBand(
  utilization: UtilizationMap,
  catalog: Phone[],
  intents: readonly NextIntent[] = [],
): BudgetBand {
  if (catalog.length === 0) {
    return { enoughEuro: 250, littleGainAbove: 450 }
  }

  const needs = deriveNeeds(utilization, intents)
  const scored = catalog
    .map((phone) => ({
      price: phone.priceEuro,
      fit: scoreFit(fitDistance(needs, phone.capabilities)),
    }))
    .sort((a, b) => a.price - b.price || b.fit - a.fit)

  const maxFit = Math.max(...scored.map((s) => s.fit))

  let runningBest = -1
  const frontier: { price: number; fit: number }[] = []
  for (const s of scored) {
    if (s.fit > runningBest) {
      runningBest = s.fit
      frontier.push({ price: s.price, fit: s.fit })
    }
  }

  const enoughHit =
    scored.find((s) => s.fit >= 70) ?? frontier[0] ?? scored[0]
  let enoughEuro = enoughHit.price

  const plateau =
    frontier.find((f) => f.fit >= maxFit - 5) ??
    frontier[frontier.length - 1] ??
    scored[scored.length - 1]
  let littleGainAbove = plateau.price

  if (littleGainAbove < enoughEuro) {
    littleGainAbove = enoughEuro
  }
  // Si el tope coincide con X, sugerir un escalón razonable por encima
  if (littleGainAbove === enoughEuro) {
    const nextHigher = scored.find((s) => s.price > enoughEuro)
    littleGainAbove = nextHigher?.price ?? enoughEuro + 100
  }

  return { enoughEuro, littleGainAbove }
}

export function budgetEnoughSentence(
  utilization: UtilizationMap,
  catalog: Phone[],
  intents: readonly NextIntent[] = [],
): string {
  const { enoughEuro, littleGainAbove } = deriveBudgetBand(
    utilization,
    catalog,
    intents,
  )
  return `Con tu uso, un móvil de ~${enoughEuro} € encaja; por encima de ${littleGainAbove} € casi no ganas nada.`
}
