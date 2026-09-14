import { describe, it, expect } from 'vitest'
import {
  recommendPhones,
  fitDistance,
  deriveNeeds,
  ALPHA_UNDER,
  BETA_OVER,
} from './recommend'
import { PHONE_CATALOG } from '../data/catalog'
import { DEMO_UTILIZATION } from '../data/demo'

describe('recommendPhones', () => {
  it('devuelve como maximo 3 recomendaciones', () => {
    const recs = recommendPhones(PHONE_CATALOG, 450, DEMO_UTILIZATION, 'equilibrado')
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.length).toBeLessThanOrEqual(3)
  })

  it('respeta el presupuesto (filtro duro +5%)', () => {
    const budget = 350
    const recs = recommendPhones(PHONE_CATALOG, budget, DEMO_UTILIZATION, 'equilibrado')
    for (const r of recs) {
      expect(r.phone.priceEuro).toBeLessThanOrEqual(budget * 1.05)
    }
  })

  it('presupuesto bajo excluye flagships', () => {
    const recs = recommendPhones(PHONE_CATALOG, 250, DEMO_UTILIZATION, 'ligero')
    expect(recs.every((r) => r.phone.priceEuro <= 250 * 1.05)).toBe(true)
    expect(recs.some((r) => r.phone.priceEuro > 700)).toBe(false)
  })

  it('gaming-foto favorece SoC/camara altos', () => {
    const recs = recommendPhones(PHONE_CATALOG, 500, DEMO_UTILIZATION, 'gaming-foto')
    expect(recs.length).toBeGreaterThan(0)
    for (const r of recs) {
      expect(r.phone.capabilities.soc).toBeGreaterThanOrEqual(55)
      expect(r.phone.capabilities.camara).toBeGreaterThanOrEqual(50)
    }
  })

  it('incluye ahorro estimado y motivos', () => {
    const recs = recommendPhones(PHONE_CATALOG, 450, DEMO_UTILIZATION, 'equilibrado')
    for (const r of recs) {
      expect(r.estimatedSavings).toBeGreaterThanOrEqual(0)
      expect(r.reasons.length).toBeGreaterThan(0)
      expect(r.fitScore).toBeGreaterThanOrEqual(0)
      expect(r.fitScore).toBeLessThanOrEqual(100)
    }
  })
})

describe('fitDistance asimetrica', () => {
  it('infra-capacidad penaliza mas que exceso', () => {
    const needs = deriveNeeds(DEMO_UTILIZATION, 'equilibrado')
    const base = { ...needs }

    const under = { ...base, soc: needs.soc - 20 }
    const over = { ...base, soc: needs.soc + 20 }

    const dUnder = fitDistance(needs, under)
    const dOver = fitDistance(needs, over)
    expect(dUnder).toBeGreaterThan(dOver)
    expect(ALPHA_UNDER).toBeGreaterThan(BETA_OVER)
  })
})
