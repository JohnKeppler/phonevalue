import { describe, expect, it } from 'vitest'
import { mapUsageToUtilization } from './mapUsage'
import type { UsageSummary } from '../native/phoneUsage'

describe('mapUsageToUtilization', () => {
  it('marks screen/camera as measured and produces utilizations', () => {
    const summary: UsageSummary = {
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
    const result = mapUsageToUtilization(
      summary,
      { totalBytes: 100, freeBytes: 40, usedBytes: 60, usedPercent: 60 },
      { batteryPercent: 70, networkTransport: 'wifi' },
      'equilibrado',
    )
    expect(result.dataSource).toBe('measured')
    expect(result.historyDays).toBe(7)
    expect(result.badges.pantalla).toBe('medido')
    expect(result.badges.camara).toBe('medido')
    expect(result.badges.storage).toBe('medido')
    expect(result.utilization.storage).toBeGreaterThan(0)
    expect(result.confidenceNote).toMatch(/confianza alta/)
  })
})
