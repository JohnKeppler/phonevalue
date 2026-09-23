import type { DeviceMeasuredInfo, DevicePublishedSpecs } from '../engine/types'

const CACHE_KEY = 'valormovil.deviceSpecs.v1'
const MATCH_CACHE_KEY = 'valormovil.deviceMatch.v1'

const SPEC_URLS = [
  'https://johnkeppler.github.io/phonevalue/catalog/device-specs.json',
  'https://raw.githubusercontent.com/JohnKeppler/phonevalue/android-native/public/catalog/device-specs.json',
  // Bundled relative (works in Capacitor + Pages)
  `${typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : '/'}catalog/device-specs.json`,
]

interface SpecRow {
  keys: string[]
  brand?: string
  name?: string
  soc?: string
  ramOptions?: string
  storageOptions?: string
  display?: string
  battery?: string
}

interface SpecFile {
  version?: number
  devices: SpecRow[]
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '')
}

function scoreMatch(info: DeviceMeasuredInfo, row: SpecRow): number {
  const candidates = [
    info.model,
    info.device,
    info.brand,
    `${info.brand} ${info.model}`,
    `${info.manufacturer} ${info.model}`,
  ].map(norm)
  let best = 0
  for (const key of row.keys) {
    const k = norm(key)
    if (!k) continue
    for (const c of candidates) {
      if (!c) continue
      if (c === k) best = Math.max(best, 100)
      else if (c.includes(k) || k.includes(c)) best = Math.max(best, 80)
      else if (c.length >= 4 && k.length >= 4 && (c.startsWith(k) || k.startsWith(c)))
        best = Math.max(best, 60)
    }
  }
  return best
}

async function loadSpecFile(): Promise<SpecFile | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached) as SpecFile & { cachedAt?: number }
      if (
        Array.isArray(parsed.devices) &&
        parsed.devices.length > 0 &&
        parsed.cachedAt &&
        Date.now() - parsed.cachedAt < 7 * 24 * 60 * 60 * 1000
      ) {
        return parsed
      }
    }
  } catch {
    /* ignore */
  }

  for (const url of SPEC_URLS) {
    try {
      const res = await fetch(url, { cache: 'no-cache' })
      if (!res.ok) continue
      const json = (await res.json()) as SpecFile
      if (!Array.isArray(json.devices) || json.devices.length === 0) continue
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ...json, cachedAt: Date.now() }),
        )
      } catch {
        /* ignore */
      }
      return json
    } catch {
      /* try next */
    }
  }
  return null
}

export async function lookupPublishedSpecs(
  info: DeviceMeasuredInfo,
): Promise<DevicePublishedSpecs | null> {
  const cacheKey = `${info.manufacturer}|${info.model}|${info.device}`
  try {
    const raw = localStorage.getItem(MATCH_CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as {
        key: string
        result: DevicePublishedSpecs | null
        at: number
      }
      if (parsed.key === cacheKey && Date.now() - parsed.at < 7 * 24 * 60 * 60 * 1000) {
        return parsed.result
      }
    }
  } catch {
    /* ignore */
  }

  const file = await loadSpecFile()
  if (!file) return null

  let best: { row: SpecRow; score: number } | null = null
  for (const row of file.devices) {
    const score = scoreMatch(info, row)
    if (score < 60) continue
    if (!best || score > best.score) best = { row, score }
  }

  const result: DevicePublishedSpecs | null = best
    ? {
        key: best.row.keys[0] ?? best.row.name ?? 'unknown',
        name: best.row.name,
        brand: best.row.brand,
        soc: best.row.soc,
        ramOptions: best.row.ramOptions,
        storageOptions: best.row.storageOptions,
        display: best.row.display,
        battery: best.row.battery,
        matchScore: best.score,
      }
    : null

  try {
    localStorage.setItem(
      MATCH_CACHE_KEY,
      JSON.stringify({ key: cacheKey, result, at: Date.now() }),
    )
  } catch {
    /* ignore */
  }

  return result
}

export function formatRamGb(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 10) return gb.toFixed(1)
  return gb.toFixed(2)
}

export function formatStorageGb(bytes: number): string {
  const gb = bytes / (1000 * 1000 * 1000)
  if (gb >= 100) return gb.toFixed(0)
  if (gb >= 10) return gb.toFixed(1)
  return gb.toFixed(2)
}
