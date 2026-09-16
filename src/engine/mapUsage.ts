import type { BadgeKind, CategoryId, UtilizationMap, UsageType } from './types'
import type {
  DeviceSignals,
  PackageUsageRow,
  StorageInfo,
  UsageSummary,
} from '../native/phoneUsage'

export interface MeasuredProfileParts {
  utilization: UtilizationMap
  badges: Record<CategoryId, BadgeKind>
  historyDays: number
  confidenceNote: string
  dataSource: 'measured'
}

/** Heuristic package → category buckets (on-device only; never uploaded). */
const RULES: { cat: CategoryId; re: RegExp }[] = [
  {
    cat: 'camara',
    re: /(camera|gcam|cameralite|snapchat|vsco|lightroom|photoshop|opencamera)/i,
  },
  {
    cat: 'audio',
    re: /(spotify|music|youtube\.music|soundcloud|deezer|tidal|podcast|audible|radio)/i,
  },
  {
    cat: 'soc',
    re: /(game|unity|roblox|minecraft|fortnite|pubg|genshin|cod\.|callofduty|steam)/i,
  },
  {
    cat: 'pantalla',
    re: /(youtube|netflix|primevideo|disney|hbo|twitch|tiktok|instagram|facebook|reddit|chrome|firefox|browser|twitter|x\.android)/i,
  },
  {
    cat: 'conectividad',
    re: /(whatsapp|telegram|signal|messenger|discord|zoom|meet|teams|skype|viber)/i,
  },
  {
    cat: 'sensores',
    re: /(fit|health|garmin|strava|maps|navigation|waze|google\.android\.apps\.maps|wallet|pay)/i,
  },
  {
    cat: 'software',
    re: /(launcher|settings|systemui|gms|vending|play\.store|samsung|xiaomi|huawei|oneplus)/i,
  },
]

function classify(pkg: string): CategoryId {
  for (const rule of RULES) {
    if (rule.re.test(pkg)) return rule.cat
  }
  return 'pantalla' // default: screen time
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function hoursToUtil(hoursPerDay: number, softCap: number): number {
  // softCap hours/day ≈ 85% utilization
  return clamp(Math.round((hoursPerDay / softCap) * 85), 5, 95)
}

/**
 * Maps UsageStats + storage + signals → category utilizations for the %/€ engine.
 */
export function mapUsageToUtilization(
  summary: UsageSummary,
  storage: StorageInfo | null,
  signals: DeviceSignals | null,
  usageType: UsageType,
): MeasuredProfileParts {
  const historyDays = Math.max(1, Math.round(summary.historyDays * 10) / 10)
  const dayDivisor = Math.max(1, summary.historyDays)

  const bucketMs: Partial<Record<CategoryId, number>> = {}
  for (const row of summary.packages as PackageUsageRow[]) {
    const cat = classify(row.packageName)
    bucketMs[cat] = (bucketMs[cat] ?? 0) + row.totalTimeInForegroundMs
  }

  const msToHoursPerDay = (ms: number) => ms / dayDivisor / 3_600_000

  const pantallaH = msToHoursPerDay(bucketMs.pantalla ?? 0)
  const camaraH = msToHoursPerDay(bucketMs.camara ?? 0)
  const audioH = msToHoursPerDay(bucketMs.audio ?? 0)
  const socH = msToHoursPerDay(bucketMs.soc ?? 0)
  const connH = msToHoursPerDay(bucketMs.conectividad ?? 0)
  const sensH = msToHoursPerDay(bucketMs.sensores ?? 0)
  const softH = msToHoursPerDay(bucketMs.software ?? 0)
  const totalH = msToHoursPerDay(summary.totalForegroundMs)

  const typeBoost =
    usageType === 'ligero' ? 0.9 : usageType === 'gaming-foto' ? 1.1 : 1

  const utilization: UtilizationMap = {
    pantalla: hoursToUtil(pantallaH * typeBoost, 6),
    camara: hoursToUtil(camaraH * typeBoost, 0.5),
    audio: hoursToUtil(audioH * typeBoost, 2),
    soc: hoursToUtil((socH + totalH * 0.15) * typeBoost, 3),
    conectividad: hoursToUtil(connH * typeBoost, 2),
    sensores: hoursToUtil(sensH * typeBoost, 0.4),
    software: hoursToUtil((softH + totalH * 0.1) * typeBoost, 1.5),
    // Storage from StatFs when available
    storage: storage
      ? clamp(Math.round(storage.usedPercent * 0.95), 8, 95)
      : 30,
    // RAM / battery / remaining estimated from signals + total use
    ram: clamp(Math.round(20 + totalH * 8), 15, 80),
    bateria: signals?.batteryPercent != null
      ? clamp(
          Math.round(
            25 +
              totalH * 6 +
              (signals.batteryCharging ? 5 : 0) +
              (100 - (signals.batteryPercent ?? 50)) * 0.15,
          ),
          15,
          90,
        )
      : clamp(Math.round(30 + totalH * 5), 20, 85),
  }

  const badges: Record<CategoryId, BadgeKind> = {
    pantalla: 'medido',
    camara: 'medido',
    audio: 'medido',
    soc: 'medido',
    conectividad: 'medido',
    sensores: 'medido',
    software: 'medido',
    storage: storage ? 'medido' : 'estimado',
    ram: 'estimado',
    bateria: signals?.batteryPercent != null ? 'medido' : 'estimado',
  }

  // Sample-size confidence
  let confidenceNote: string
  if (historyDays < 2) {
    confidenceNote = `Solo ~${historyDays} día(s) de historial — confianza baja. Úsalo unos días más y vuelve a leer.`
  } else if (historyDays < 7) {
    confidenceNote = `${historyDays} días de historial — confianza media.`
  } else {
    confidenceNote = `${historyDays} días de historial — confianza alta.`
  }

  return {
    utilization,
    badges,
    historyDays,
    confidenceNote,
    dataSource: 'measured',
  }
}
