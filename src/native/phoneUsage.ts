import { Capacitor, registerPlugin } from '@capacitor/core'
import type { DeviceMeasuredInfo } from '../engine/types'

export interface PackageUsageRow {
  packageName: string
  totalTimeInForegroundMs: number
  lastTimeUsed: number
}

export interface UsageSummary {
  beginTime: number
  endTime: number
  rangeDaysRequested: number
  earliestTimestamp: number
  latestTimestamp: number
  historyDays: number
  totalForegroundMs: number
  packages: PackageUsageRow[]
}

export interface StorageInfo {
  totalBytes: number
  freeBytes: number
  usedBytes: number
  usedPercent: number
  /** storage_manager | statfs — how totals were obtained */
  source?: string
  /** Optional marketed-ish total when usable capacity differs (e.g. 256 GB) */
  marketedTotalBytes?: number
}

export interface DeviceSignals {
  batteryPercent?: number
  batteryChargeCounterUaH?: number
  batteryCharging?: boolean
  batteryPlugged?: boolean
  networkTransport?: string
  networkValidated?: boolean
}

export interface DeviceInfoNative {
  manufacturer?: string
  brand?: string
  model?: string
  device?: string
  product?: string
  sku?: string
  totalRamBytes?: number
  availRamBytes?: number
  lowMemory?: boolean
  displayWidthPx?: number
  displayHeightPx?: number
  densityDpi?: number
  density?: number
  windowWidthPx?: number
  windowHeightPx?: number
  refreshRateHz?: number
}

export interface PhoneUsagePlugin {
  isUsageAccessGranted(): Promise<{ granted: boolean }>
  openUsageAccessSettings(): Promise<void>
  getUsageSummary(options?: { rangeDays?: number }): Promise<UsageSummary>
  getStorageInfo(): Promise<StorageInfo>
  getDeviceSignals(): Promise<DeviceSignals>
  getDeviceInfo(): Promise<DeviceInfoNative>
}

const PhoneUsage = registerPlugin<PhoneUsagePlugin>('PhoneUsage')

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function toMeasuredInfo(
  raw: DeviceInfoNative,
  storage?: StorageInfo | null,
): DeviceMeasuredInfo {
  return {
    manufacturer: raw.manufacturer ?? '',
    brand: raw.brand ?? '',
    model: raw.model ?? '',
    device: raw.device ?? '',
    totalRamBytes: Number(raw.totalRamBytes) || 0,
    availRamBytes: Number(raw.availRamBytes) || 0,
    storageTotalBytes: storage?.totalBytes,
    storageUsedBytes: storage?.usedBytes,
    displayWidthPx: raw.displayWidthPx,
    displayHeightPx: raw.displayHeightPx,
    densityDpi: raw.densityDpi,
    refreshRateHz:
      typeof raw.refreshRateHz === 'number' ? raw.refreshRateHz : undefined,
  }
}

export { PhoneUsage }
