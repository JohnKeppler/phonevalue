import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CategoryResult,
  DeviceMeasuredInfo,
  DevicePublishedSpecs,
} from '../engine/types'
import {
  formatRamGb,
  formatStorageGb,
  lookupPublishedSpecs,
} from '../data/deviceSpecs'

interface Props {
  category: CategoryResult
  onClose: () => void
  storageUsedBytes?: number
  storageTotalBytes?: number
  deviceInfo?: DeviceMeasuredInfo
}

function formatGb(bytes: number): string {
  const gb = bytes / (1000 * 1000 * 1000)
  if (gb >= 100) return gb.toFixed(0)
  if (gb >= 10) return gb.toFixed(1)
  return gb.toFixed(2)
}

export function CategoryDetail({
  category,
  onClose,
  storageUsedBytes,
  storageTotalBytes,
  deviceInfo,
}: Props) {
  const { t } = useTranslation()
  const [published, setPublished] = useState<DevicePublishedSpecs | null | undefined>(
    undefined,
  )

  useEffect(() => {
    let cancelled = false
    if (!deviceInfo) {
      setPublished(null)
      return
    }
    lookupPublishedSpecs(deviceInfo).then((res) => {
      if (!cancelled) setPublished(res)
    })
    return () => {
      cancelled = true
    }
  }, [deviceInfo])

  const showStorageBytes =
    category.id === 'storage' &&
    category.badge === 'medido' &&
    storageUsedBytes != null &&
    storageTotalBytes != null &&
    storageTotalBytes > 0

  const occupiedPct = showStorageBytes
    ? Math.round((100 * storageUsedBytes!) / storageTotalBytes!)
    : null

  const showDeviceBlock =
    !!deviceInfo &&
    (category.id === 'ram' ||
      category.id === 'storage' ||
      category.id === 'pantalla' ||
      category.id === 'soc' ||
      category.id === 'bateria')

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-600 bg-slate-800 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="cat-title" className="text-lg font-bold text-white">
              {category.label}
            </h2>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                category.badge === 'medido'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {category.badge === 'medido'
                ? t('category.badgeMeasured')
                : t('category.badgeEstimated')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label={t('app.close')}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <Stat label={t('category.weight')} value={`${category.weight}%`} />
          <Stat label={t('category.usage')} value={`${category.utilization}%`} />
          <Stat
            label={t('category.assigned')}
            value={`${category.assignedEuro} €`}
          />
        </div>

        {showStorageBytes && (
          <p className="mb-4 rounded-xl border border-slate-600/80 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
            {t('category.occupied', {
              used: formatGb(storageUsedBytes!),
              total: formatGb(storageTotalBytes!),
              pct: occupiedPct,
            })}
          </p>
        )}

        {showDeviceBlock && deviceInfo && (
          <DeviceSheetBlock
            categoryId={category.id}
            info={deviceInfo}
            published={published}
          />
        )}

        <div className="mb-4 flex justify-between rounded-xl bg-slate-900/60 px-3 py-2 text-sm">
          <span className="text-emerald-400">
            {t('category.used', { n: category.usedEuro })}
          </span>
          <span className="text-orange-400">
            {t('category.wasted', { n: category.wastedEuro })}
          </span>
        </div>

        <div className="rounded-xl border border-slate-600/80 bg-slate-900/40 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t('category.howTitle')}
          </h3>
          <p className="text-sm leading-relaxed text-slate-300">
            {category.howCalculated}
          </p>
        </div>
      </div>
    </div>
  )
}

function DeviceSheetBlock({
  categoryId,
  info,
  published,
}: {
  categoryId: string
  info: DeviceMeasuredInfo
  published: DevicePublishedSpecs | null | undefined
}) {
  const { t } = useTranslation()
  const refresh =
    info.refreshRateHz != null && info.refreshRateHz > 0
      ? t('category.refreshHz', { hz: Math.round(info.refreshRateHz) })
      : ''

  return (
    <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-600/10 p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-200">
        {t('category.deviceBlock')}
      </h3>
      <p className="mb-2 text-sm text-white">
        {[info.brand || info.manufacturer, info.model].filter(Boolean).join(' ')}
        {info.device ? (
          <span className="text-slate-400"> ({info.device})</span>
        ) : null}
      </p>
      <ul className="space-y-1.5 text-sm text-slate-200">
        {(categoryId === 'ram' || categoryId === 'soc') && info.totalRamBytes > 0 && (
          <li>
            {t('category.ramMeasured', {
              gb: formatRamGb(info.totalRamBytes),
            })}
          </li>
        )}
        {categoryId === 'ram' && info.availRamBytes > 0 && (
          <li>
            {t('category.ramAvail', { gb: formatRamGb(info.availRamBytes) })}
          </li>
        )}
        {categoryId === 'storage' &&
          info.storageTotalBytes != null &&
          info.storageUsedBytes != null && (
            <li>
              {t('category.storageMeasured', {
                used: formatStorageGb(info.storageUsedBytes),
                total: formatStorageGb(info.storageTotalBytes),
              })}
            </li>
          )}
        {categoryId === 'pantalla' &&
          info.displayWidthPx != null &&
          info.displayHeightPx != null && (
            <li>
              {t('category.displayMeasured', {
                w: info.displayWidthPx,
                h: info.displayHeightPx,
                dpi: info.densityDpi ?? '—',
                refresh,
              })}
            </li>
          )}
      </ul>

      {published === undefined ? null : published == null ? (
        <p className="mt-2 text-xs text-slate-400">{t('app.noPublishedMatch')}</p>
      ) : (
        <div className="mt-3 border-t border-slate-700/80 pt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {t('app.publishedSheet')}
            {published.name ? ` · ${published.name}` : ''}
          </p>
          <ul className="space-y-1 text-sm text-slate-200">
            {published.soc && (
              <li>{t('category.publishedSoc', { v: published.soc })}</li>
            )}
            {published.ramOptions && (
              <li>{t('category.publishedRam', { v: published.ramOptions })}</li>
            )}
            {published.storageOptions && (
              <li>
                {t('category.publishedStorage', {
                  v: published.storageOptions,
                })}
              </li>
            )}
            {published.display && (
              <li>
                {t('category.publishedDisplay', { v: published.display })}
              </li>
            )}
            {published.battery && (
              <li>
                {t('category.publishedBattery', { v: published.battery })}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-900/50 px-2 py-2">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  )
}
