import { Capacitor, registerPlugin } from '@capacitor/core'

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
}

export interface DeviceSignals {
  batteryPercent?: number
  batteryChargeCounterUaH?: number
  batteryCharging?: boolean
  batteryPlugged?: boolean
  networkTransport?: string
  networkValidated?: boolean
}

export interface PhoneUsagePlugin {
  isUsageAccessGranted(): Promise<{ granted: boolean }>
  openUsageAccessSettings(): Promise<void>
  getUsageSummary(options?: { rangeDays?: number }): Promise<UsageSummary>
  getStorageInfo(): Promise<StorageInfo>
  getDeviceSignals(): Promise<DeviceSignals>
}

const PhoneUsage = registerPlugin<PhoneUsagePlugin>('PhoneUsage')

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export { PhoneUsage }
