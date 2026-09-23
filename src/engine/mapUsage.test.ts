import { describe, expect, it } from 'vitest'
import { mapUsageToUtilization } from './mapUsage'
import type { UsageSummary } from '../native/phoneUsage'

const baseSummary: UsageSummary = {
  beginTime: 0,
  endTime: 7 * 86400000,
  rangeDaysRequested: 7,
  earliestTimestamp: 0,
  latestTimestamp: 7 * 86400000,
  historyDays: 7,
  totalForegroundMs: 20 * 3600000,
  packages: [
    {
      packageName: 'com.google.android.youtube',
      totalTimeInForegroundMs: 10 * 3600000,
      lastTimeUsed: 1,
    },
    {
      packageName: 'com.google.android.GoogleCamera',
      totalTimeInForegroundMs: 1 * 3600000,
      lastTimeUsed: 1,
    },
  ],
}

describe('mapUsageToUtilization', () => {
  it('marks screen/camera as measured and produces utilizations', () => {
    const result = mapUsageToUtilization(
      baseSummary,
      { totalBytes: 100, freeBytes: 40, usedBytes: 60, usedPercent: 60 },
      { batteryPercent: 70, networkTransport: 'wifi' },
    )
    expect(result.dataSource).toBe('measured')
    expect(result.historyDays).toBe(7)
    expect(result.badges.pantalla).toBe('medido')
    expect(result.badges.camara).toBe('medido')
    expect(result.badges.storage).toBe('medido')
    expect(result.utilization.storage).toBe(60)
    expect(result.storageUsedBytes).toBe(60)
    expect(result.storageTotalBytes).toBe(100)
    expect(result.confidenceNote).toMatch(/confianza alta/)
  })

  it('uses rounded usedPercent directly (no 0.95 shrink)', () => {
    const result = mapUsageToUtilization(
      baseSummary,
      {
        totalBytes: 256e9,
        freeBytes: 73e9,
        usedBytes: 183e9,
        usedPercent: 71.484375,
      },
      null,
    )
    expect(result.utilization.storage).toBe(71)
    expect(result.badges.storage).toBe('medido')
    expect(result.storageUsedBytes).toBe(183e9)
    expect(result.storageTotalBytes).toBe(256e9)
  })

  it('keeps storage estimado with fallback when storage is null', () => {
    const result = mapUsageToUtilization(baseSummary, null, null)
    expect(result.badges.storage).toBe('estimado')
    expect(result.utilization.storage).toBe(30)
    expect(result.storageUsedBytes).toBeUndefined()
    expect(result.storageTotalBytes).toBeUndefined()
  })
})
