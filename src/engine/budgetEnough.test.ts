import { describe, expect, it } from 'vitest'
import { DEMO_UTILIZATION } from '../data/demo'
import { PHONE_CATALOG } from '../data/catalog'
import {
  budgetEnoughSentence,
  deriveBudgetBand,
} from './budgetEnough'

describe('deriveBudgetBand / budgetEnoughSentence', () => {
  it('devuelve X e Y positivos con Y >= X', () => {
    const band = deriveBudgetBand(DEMO_UTILIZATION, PHONE_CATALOG)
    expect(band.enoughEuro).toBeGreaterThan(0)
    expect(band.littleGainAbove).toBeGreaterThanOrEqual(band.enoughEuro)
  })

  it('la frase en español incluye ambos precios', () => {
    const band = deriveBudgetBand(DEMO_UTILIZATION, PHONE_CATALOG)
    const sentence = budgetEnoughSentence(DEMO_UTILIZATION, PHONE_CATALOG)
    expect(sentence).toMatch(/Con tu uso, un móvil de ~\d+ € encaja/)
    expect(sentence).toContain(`~${band.enoughEuro} €`)
    expect(sentence).toContain(`${band.littleGainAbove} €`)
    expect(sentence).toMatch(/casi no ganas nada/)
  })

  it('un uso exigente sube la banda respecto a un uso muy bajo', () => {
    const low = Object.fromEntries(
      Object.keys(DEMO_UTILIZATION).map((k) => [k, 15]),
    )
    const high = Object.fromEntries(
      Object.keys(DEMO_UTILIZATION).map((k) => [k, 85]),
    )
    const bandLow = deriveBudgetBand(low, PHONE_CATALOG)
    const bandHigh = deriveBudgetBand(high, PHONE_CATALOG)
    expect(bandHigh.enoughEuro).toBeGreaterThanOrEqual(bandLow.enoughEuro)
  })

  it('catálogo vacío no rompe (fallback)', () => {
    const band = deriveBudgetBand(DEMO_UTILIZATION, [])
    expect(band.enoughEuro).toBe(250)
    expect(band.littleGainAbove).toBe(450)
  })
})
