import { describe, it, expect } from 'vitest'
import { calculateUtilization } from './calculate'
import { CATEGORIES, WEIGHT_SUM } from './weights'
import { DEMO_UTILIZATION } from '../data/demo'

describe('weights', () => {
  it('suman 100%', () => {
    expect(WEIGHT_SUM).toBe(100)
    expect(CATEGORIES).toHaveLength(10)
  })
})

describe('calculateUtilization', () => {
  it('perfil demo 1000€ → ~310 usados / ~690 desperdiciados / ~31%', () => {
    const result = calculateUtilization(1000, DEMO_UTILIZATION)

    expect(result.totalUsedEuro).toBeCloseTo(310, 0)
    expect(result.totalWastedEuro).toBeCloseTo(690, 0)
    expect(result.globalS).toBeCloseTo(31, 0)
    expect(result.price).toBe(1000)
    expect(result.categories).toHaveLength(10)
  })

  it('desglose por categoria coherente', () => {
    const result = calculateUtilization(1000, DEMO_UTILIZATION)
    const soc = result.categories.find((c) => c.id === 'soc')!
    // 1000 * 0.16 * 0.25 = 40
    expect(soc.assignedEuro).toBe(160)
    expect(soc.usedEuro).toBe(40)
    expect(soc.wastedEuro).toBe(120)
    expect(soc.utilization).toBe(25)

    const pantalla = result.categories.find((c) => c.id === 'pantalla')!
    // 1000 * 0.18 * 0.40 = 72
    expect(pantalla.usedEuro).toBe(72)
  })

  it('S = 100 cuando utilizacion es 100% en todo', () => {
    const full: Record<string, number> = {}
    for (const c of CATEGORIES) full[c.id] = 100
    const result = calculateUtilization(800, full)
    expect(result.globalS).toBe(100)
    expect(result.totalUsedEuro).toBe(800)
    expect(result.totalWastedEuro).toBe(0)
  })

  it('rechaza precio no positivo', () => {
    expect(() => calculateUtilization(0, DEMO_UTILIZATION)).toThrow()
    expect(() => calculateUtilization(-10, DEMO_UTILIZATION)).toThrow()
  })
})
