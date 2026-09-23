import type { Phone, PhoneNeeds } from '../engine/types'
import { PHONE_CATALOG, CATALOG_PRICE_DISCLAIMER } from './catalog'

const CACHE_KEY = 'valormovil.catalog.v1'

/** Stable URLs — Pages first, then GitHub raw on android-native. */
export const CATALOG_URLS = [
  'https://johnkeppler.github.io/phonevalue/catalog.json',
  'https://raw.githubusercontent.com/JohnKeppler/phonevalue/android-native/public/catalog.json',
]

export type CatalogSource = 'network' | 'cache' | 'bundled'

export interface CatalogFeedMeta {
  version?: number
  updatedAt?: string
  currency?: string
  disclaimer?: string
}

export interface CatalogState {
  phones: Phone[]
  source: CatalogSource
  fetchedAt: number
  feedUpdatedAt?: string
  disclaimer: string
}

interface FeedPhone {
  id: string
  brand: string
  name: string
  modelCodes?: string[]
  priceEur?: number
  priceEuro?: number
  currency?: string
  capabilities: PhoneNeeds
  highlights?: string[]
  purchaseUrl?: string
}

interface FeedFile extends CatalogFeedMeta {
  phones: FeedPhone[]
}

function normalizePhone(raw: FeedPhone): Phone | null {
  if (!raw?.id || !raw.brand || !raw.name || !raw.capabilities) return null
  const price = raw.priceEur ?? raw.priceEuro
  if (typeof price !== 'number' || !(price > 0)) return null
  const caps = raw.capabilities
  const keys: (keyof PhoneNeeds)[] = [
    'soc',
    'pantalla',
    'camara',
    'storage',
    'ram',
    'bateria',
    'conectividad',
    'audio',
    'sensores',
    'software',
  ]
  for (const k of keys) {
    const v = caps[k]
    if (typeof v !== 'number' || v < 0 || v > 100) return null
  }
  return {
    id: raw.id,
    brand: raw.brand,
    name: raw.name,
    priceEuro: price,
    currency: raw.currency ?? 'EUR',
    capabilities: caps,
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    modelCodes: Array.isArray(raw.modelCodes) ? raw.modelCodes : undefined,
    purchaseUrl: typeof raw.purchaseUrl === 'string' ? raw.purchaseUrl : undefined,
  }
}

function parseFeed(data: unknown): { phones: Phone[]; meta: CatalogFeedMeta } | null {
  if (!data || typeof data !== 'object') return null
  const feed = data as FeedFile
  if (!Array.isArray(feed.phones) || feed.phones.length < 5) return null
  const phones: Phone[] = []
  for (const row of feed.phones) {
    const p = normalizePhone(row)
    if (p) phones.push(p)
  }
  if (phones.length < 5) return null
  return {
    phones,
    meta: {
      version: feed.version,
      updatedAt: feed.updatedAt,
      currency: feed.currency,
      disclaimer: feed.disclaimer,
    },
  }
}

function bundledState(): CatalogState {
  return {
    phones: PHONE_CATALOG,
    source: 'bundled',
    fetchedAt: 0,
    disclaimer: CATALOG_PRICE_DISCLAIMER,
  }
}

function readCache(): CatalogState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      phones: Phone[]
      fetchedAt: number
      feedUpdatedAt?: string
      disclaimer?: string
    }
    if (!Array.isArray(parsed.phones) || parsed.phones.length < 5) return null
    return {
      phones: parsed.phones,
      source: 'cache',
      fetchedAt: parsed.fetchedAt ?? 0,
      feedUpdatedAt: parsed.feedUpdatedAt,
      disclaimer: parsed.disclaimer ?? CATALOG_PRICE_DISCLAIMER,
    }
  } catch {
    return null
  }
}

function writeCache(state: CatalogState) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        phones: state.phones,
        fetchedAt: state.fetchedAt,
        feedUpdatedAt: state.feedUpdatedAt,
        disclaimer: state.disclaimer,
      }),
    )
  } catch {
    /* ignore */
  }
}

async function fetchUrl(url: string): Promise<CatalogState | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: 'no-cache',
    })
    if (!res.ok) return null
    const json: unknown = await res.json()
    const parsed = parseFeed(json)
    if (!parsed) return null
    return {
      phones: parsed.phones,
      source: 'network',
      fetchedAt: Date.now(),
      feedUpdatedAt: parsed.meta.updatedAt,
      disclaimer: parsed.meta.disclaimer ?? CATALOG_PRICE_DISCLAIMER,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch remote catalog; fall back to cache then bundled.
 * Always returns a usable catalog.
 */
export async function loadCatalog(opts?: {
  forceNetwork?: boolean
}): Promise<CatalogState> {
  const cached = readCache()
  if (!opts?.forceNetwork && cached && Date.now() - cached.fetchedAt < 12 * 60 * 60 * 1000) {
    // Still try a background refresh but return cache immediately path:
    // For simplicity, attempt network first when stale; when fresh, use cache.
    return cached
  }

  for (const url of CATALOG_URLS) {
    const remote = await fetchUrl(url)
    if (remote) {
      writeCache(remote)
      return remote
    }
  }

  if (cached) return cached
  return bundledState()
}

export function formatCatalogUpdated(
  state: CatalogState,
  locale: string,
): string {
  if (state.feedUpdatedAt) {
    const d = new Date(state.feedUpdatedAt)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    return state.feedUpdatedAt
  }
  if (state.fetchedAt > 0) {
    return new Date(state.fetchedAt).toLocaleString(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }
  return '—'
}
