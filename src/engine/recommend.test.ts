import { describe, it, expect } from 'vitest'
import {
  recommendPhones,
  fitDistance,
  deriveNeeds,
  ALPHA_UNDER,
  BETA_OVER,
  INTENT_BOOST,
  NEED_HEADROOM,
} from './recommend'
import { PHONE_CATALOG } from '../data/catalog'
import { DEMO_UTILIZATION } from '../data/demo'
import type { Phone, PhoneNeeds, UtilizationMap } from './types'

function flatCaps(soc: number): PhoneNeeds {
  return {
    soc,
    pantalla: 50,
    camara: 50,
    storage: 50,
    ram: 50,
    bateria: 50,
    conectividad: 50,
    audio: 50,
    sensores: 50,
    software: 50,
  }
}

function phone(id: string, soc: number): Phone {
  return {
    id,
    name: id,
    brand: 'X',
    priceEuro: 300,
    capabilities: flatCaps(soc),
    highlights: ['nota'],
  }
}

const MIXED_USE: UtilizationMap = {
  soc: 30,
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

describe('recommendPhones', () => {
  it('devuelve como maximo 10 por defecto', () => {
    const recs = recommendPhones(PHONE_CATALOG, {
      utilization: DEMO_UTILIZATION,
      maxPrice: 2000,
    })
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.length).toBeLessThanOrEqual(10)
    expect(recs.length).toBe(10)
  })

  it('respeta el precio maximo inclusive', () => {
    const budget = 350
    const recs = recommendPhones(PHONE_CATALOG, {
      utilization: DEMO_UTILIZATION,
      maxPrice: budget,
      topN: 20,
    })
    expect(recs.length).toBeGreaterThan(0)
    for (const r of recs) {
      expect(r.phone.priceEuro).toBeLessThanOrEqual(budget)
    }
  })

  it('presupuesto bajo excluye flagships', () => {
    const recs = recommendPhones(PHONE_CATALOG, {
      utilization: DEMO_UTILIZATION,
      maxPrice: 250,
      topN: 20,
    })
    expect(recs.every((r) => r.phone.priceEuro <= 250)).toBe(true)
    expect(recs.some((r) => r.phone.priceEuro > 700)).toBe(false)
  })

  it('filtra minimo, marcas incluidas y excluidas', () => {
    const recs = recommendPhones(PHONE_CATALOG, {
      utilization: DEMO_UTILIZATION,
      minPrice: 400,
      maxPrice: 2000,
      includeBrands: ['Samsung', 'Google'],
      excludeBrands: ['Samsung'],
      topN: 20,
    })
    expect(recs.length).toBeGreaterThan(0)
    for (const r of recs) {
      expect(r.phone.brand).toBe('Google')
      expect(r.phone.priceEuro).toBeGreaterThanOrEqual(400)
    }
  })

  it('incluye ahorro estimado y motivos', () => {
    const recs = recommendPhones(PHONE_CATALOG, {
      utilization: DEMO_UTILIZATION,
      maxPrice: 450,
      topN: 3,
    })
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.length).toBeLessThanOrEqual(3)
    for (const r of recs) {
      expect(r.estimatedSavings).toBeGreaterThanOrEqual(0)
      expect(r.estimatedSavings).toBeCloseTo(450 - r.phone.priceEuro, 2)
      expect(r.reasons.length).toBeGreaterThan(0)
      expect(r.fitScore).toBeGreaterThanOrEqual(0)
      expect(r.fitScore).toBeLessThanOrEqual(100)
    }
  })

  it('la intencion juegos favorece un SoC mas alto al ordenar', () => {
    const catalog = [phone('ajustado', 30), phone('potente', 55)]
    const base = recommendPhones(catalog, {
      utilization: MIXED_USE,
      intents: [],
      topN: 2,
      maxPrice: 500,
    })
    const juegos = recommendPhones(catalog, {
      utilization: MIXED_USE,
      intents: ['juegos'],
      topN: 2,
      maxPrice: 500,
    })
    expect(base[0].phone.id).toBe('ajustado')
    expect(juegos[0].phone.id).toBe('potente')
  })
})

describe('deriveNeeds e intenciones', () => {
  it('sin intenciones solo aplica el margen de confort', () => {
    const needs = deriveNeeds(DEMO_UTILIZATION, [])
    expect(needs.soc).toBeCloseTo(25 * NEED_HEADROOM, 5)
    expect(needs.camara).toBeCloseTo(20 * NEED_HEADROOM, 5)
  })

  it('cada intencion sube solo su categoria', () => {
    const plain = deriveNeeds(DEMO_UTILIZATION, [])
    const juegos = deriveNeeds(DEMO_UTILIZATION, ['juegos'])
    const fotos = deriveNeeds(DEMO_UTILIZATION, ['fotos'])
    const varias = deriveNeeds(DEMO_UTILIZATION, [
      'juegos',
      'fotos',
      'almacenamiento',
    ])

    expect(juegos.soc).toBeCloseTo(plain.soc * INTENT_BOOST, 5)
    expect(juegos.camara).toBeCloseTo(plain.camara, 5)
    expect(juegos.pantalla).toBeCloseTo(plain.pantalla, 5)
    expect(fotos.camara).toBeGreaterThan(plain.camara)
    expect(fotos.soc).toBeCloseTo(plain.soc, 5)
    expect(varias.storage).toBeGreaterThan(plain.storage)
    expect(varias.bateria).toBeCloseTo(plain.bateria, 5)
  })
})

describe('fitDistance asimetrica', () => {
  it('infra-capacidad penaliza mas que exceso', () => {
    const needs = deriveNeeds(DEMO_UTILIZATION, [])
    const base = { ...needs }

    const under = { ...base, soc: needs.soc - 20 }
    const over = { ...base, soc: needs.soc + 20 }

    const dUnder = fitDistance(needs, under)
    const dOver = fitDistance(needs, over)
    expect(dUnder).toBeGreaterThan(dOver)
    expect(ALPHA_UNDER).toBeGreaterThan(BETA_OVER)
  })
})
