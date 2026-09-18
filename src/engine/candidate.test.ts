import { describe, expect, it } from 'vitest'
import { calculateUtilization } from './calculate'
import { CATEGORIES } from './weights'
import { DEMO_UTILIZATION } from '../data/demo'
import {
  candidateCategoryUtilization,
  candidateWastedEuro,
  deriveNeeds,
} from './recommend'
import { specLabel, usageSentence } from './specs'
import type { PhoneNeeds, UtilizationMap } from './types'

const ALL_40: UtilizationMap = {
  soc: 40,
  pantalla: 40,
  camara: 40,
  storage: 40,
  ram: 40,
  bateria: 40,
  conectividad: 40,
  audio: 40,
  sensores: 40,
  software: 40,
}

describe('desperdicio en euros de un candidato', () => {
  it('precio 1000 con capacidad 100 y uso 40 desperdicia 540 €', () => {
    const caps = {} as PhoneNeeds
    for (const c of CATEGORIES) caps[c.id] = 100
    // necesidad = 40 * 1.15 = 46 → aprovechamiento 46 % → 460 usados / 540 sobran
    const waste = candidateWastedEuro(1000, ALL_40, caps)
    expect(waste).toBe(540)
    const used = calculateUtilization(1000, candidateCategoryUtilization(ALL_40, caps))
    expect(used.totalUsedEuro).toBe(460)
    expect(used.totalWastedEuro).toBe(540)
  })

  it('no usa las intenciones de compra: el mismo perfil da el mismo desperdicio', () => {
    const caps = {} as PhoneNeeds
    for (const c of CATEGORIES) caps[c.id] = 80
    const waste = candidateWastedEuro(499, DEMO_UTILIZATION, caps)
    deriveNeeds(DEMO_UTILIZATION, ['juegos', 'fotos', 'bateria'])
    expect(candidateWastedEuro(499, DEMO_UTILIZATION, caps)).toBe(waste)
  })
})

describe('utilizacion por categoria de un candidato', () => {
  it('capacidad frente a necesidad, topada al 100 si se queda corto', () => {
    const caps = {
      soc: 80,
      pantalla: 100,
      camara: 50,
      storage: 100,
      ram: 100,
      bateria: 20,
      conectividad: 100,
      audio: 100,
      sensores: 100,
      software: 100,
    } satisfies PhoneNeeds
    const u = candidateCategoryUtilization(ALL_40, caps)
    // necesidad 46 en todas
    expect(u.soc).toBe(57)
    expect(u.pantalla).toBe(46)
    expect(u.camara).toBe(92)
    expect(u.bateria).toBe(100)
    expect(Object.keys(u)).toHaveLength(10)
    for (const c of CATEGORIES) {
      expect(u[c.id]).toBeGreaterThanOrEqual(0)
      expect(u[c.id]).toBeLessThanOrEqual(100)
    }
  })
})

describe('intenciones y panel del movil actual', () => {
  it('el boost del proximo movil no cambia la formula del panel', () => {
    const dash = calculateUtilization(1000, DEMO_UTILIZATION)
    expect(dash.totalUsedEuro).toBeCloseTo(310, 0)
    expect(dash.totalWastedEuro).toBeCloseTo(690, 0)
    expect(dash.globalS).toBeCloseTo(31, 0)

    const plain = deriveNeeds(DEMO_UTILIZATION, [])
    const boosted = deriveNeeds(DEMO_UTILIZATION, ['juegos', 'fotos'])
    expect(boosted.soc).toBeGreaterThan(plain.soc)
    expect(boosted.camara).toBeGreaterThan(plain.camara)

    const again = calculateUtilization(1000, DEMO_UTILIZATION)
    expect(again.categories.map((c) => c.utilization)).toEqual(
      dash.categories.map((c) => c.utilization),
    )
    expect(again.totalWastedEuro).toBe(dash.totalWastedEuro)
    expect(again.globalS).toBe(dash.globalS)
  })
})

describe('etiquetas de ficha', () => {
  it('la frase nombra la pieza y el porcentaje, sin hablar de desperdicio', () => {
    expect(specLabel('soc', 82)).toBe('chip de gama alta')
    const sentence = usageSentence('soc', 82, 25)
    expect(sentence).toContain('Procesador')
    expect(sentence).toContain('chip de gama alta')
    expect(sentence).toContain('25 %')
    expect(sentence.toLowerCase()).not.toContain('desperdic')
    for (const c of CATEGORIES) {
      const line = usageSentence(c.id, 60, 40)
      expect(line).toContain('40 %')
      expect(line.toLowerCase()).not.toContain('desperdic')
    }
  })
})
