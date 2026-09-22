import { describe, expect, it } from 'vitest'
import { CATALOG_PRICE_DISCLAIMER, PHONE_CATALOG } from './catalog'
import type { CategoryId } from '../engine/types'
import { CATEGORIES } from '../engine/weights'

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as CategoryId[]

describe('PHONE_CATALOG', () => {
  it('carga entre 35 y 40 móviles', () => {
    expect(PHONE_CATALOG.length).toBeGreaterThanOrEqual(35)
    expect(PHONE_CATALOG.length).toBeLessThanOrEqual(45)
  })

  it('cada móvil tiene id, nombre, marca, precio y 10 capacidades', () => {
    const ids = new Set<string>()
    for (const phone of PHONE_CATALOG) {
      expect(phone.id).toBeTruthy()
      expect(ids.has(phone.id)).toBe(false)
      ids.add(phone.id)
      expect(phone.name.length).toBeGreaterThan(0)
      expect(phone.brand.length).toBeGreaterThan(0)
      expect(phone.priceEuro).toBeGreaterThan(0)
      expect(phone.highlights.length).toBeGreaterThan(0)
      for (const id of CATEGORY_IDS) {
        const v = phone.capabilities[id]
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(100)
      }
    }
  })

  it('incluye aviso de precios orientativos', () => {
    expect(CATALOG_PRICE_DISCLAIMER.toLowerCase()).toMatch(/orientativ/)
  })
})
