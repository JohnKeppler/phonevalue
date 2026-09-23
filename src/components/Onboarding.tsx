import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { NextIntent, UserProfile } from '../engine/types'
import { DEMO_PROFILE } from '../data/demo'
import { getIntentOptions } from '../data/intents'
import {
  isNativeAndroid,
  PhoneUsage,
  toMeasuredInfo,
} from '../native/phoneUsage'
import { mapUsageToUtilization } from '../engine/mapUsage'
import { APP_VERSION, RELEASES_LATEST_URL } from '../version'
import { LanguageSwitcher } from './LanguageSwitcher'

interface Props {
  onComplete: (profile: UserProfile) => void
  savedProfile?: UserProfile | null
  onRestore?: () => void
}

export function Onboarding({ onComplete, savedProfile, onRestore }: Props) {
  const { t } = useTranslation()
  const [priceText, setPriceText] = useState(
    savedProfile ? String(savedProfile.purchasePrice) : '400',
  )
  const [budgetText, setBudgetText] = useState(
    savedProfile ? String(savedProfile.nextBudget) : '250',
  )
  const [intents, setIntents] = useState<NextIntent[]>(
    savedProfile?.nextIntents ?? [],
  )
  const [native, setNative] = useState(false)
  const [usageGranted, setUsageGranted] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!savedProfile) return
    setPriceText(String(savedProfile.purchasePrice))
    setBudgetText(String(savedProfile.nextBudget))
    setIntents(savedProfile.nextIntents ?? [])
  }, [savedProfile])

  useEffect(() => {
    const isNative = isNativeAndroid()
    setNative(isNative)
    if (!isNative) return
    PhoneUsage.isUsageAccessGranted()
      .then((r) => setUsageGranted(r.granted))
      .catch(() => setUsageGranted(false))
  }, [])

  function parseEuros(raw: string, fallback: number): number {
    const cleaned = raw.replace(/[^0-9]/g, '')
    if (cleaned === '') return fallback
    const n = Number(cleaned)
    if (!Number.isFinite(n) || n <= 0) return fallback
    return Math.min(2500, Math.max(50, n))
  }

  function toggleIntent(id: NextIntent) {
    setIntents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function loadDemo() {
    onComplete({ ...DEMO_PROFILE, dataSource: 'demo' })
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const price = parseEuros(priceText, 400)
    const budget = parseEuros(budgetText, 250)
    setPriceText(String(price))
    setBudgetText(String(budget))
    onComplete({
      purchasePrice: price,
      nextBudget: budget,
      nextIntents: intents,
      utilization: { ...DEMO_PROFILE.utilization },
      dataSource: 'synthetic',
    })
  }

  async function openUsageSettings() {
    setError(null)
    try {
      await PhoneUsage.openUsageAccessSettings()
      setStatus(t('onboarding.usageSettingsHint'))
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t('onboarding.openSettingsError'),
      )
    }
  }

  async function refreshPermission() {
    try {
      const r = await PhoneUsage.isUsageAccessGranted()
      setUsageGranted(r.granted)
      setStatus(r.granted ? t('onboarding.permOk') : null)
    } catch {
      setUsageGranted(false)
    }
  }

  async function readPhoneData() {
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      const { granted } = await PhoneUsage.isUsageAccessGranted()
      setUsageGranted(granted)
      if (!granted) {
        setError(t('onboarding.needUsage'))
        setBusy(false)
        return
      }

      let storageFailed = false
      const [summary, storage, signals, deviceRaw] = await Promise.all([
        PhoneUsage.getUsageSummary({ rangeDays: 30 }),
        PhoneUsage.getStorageInfo().catch(() => {
          storageFailed = true
          return null
        }),
        PhoneUsage.getDeviceSignals().catch(() => null),
        PhoneUsage.getDeviceInfo().catch(() => null),
      ])

      const measured = mapUsageToUtilization(summary, storage, signals)

      let confidenceNote = measured.confidenceNote
      if (storageFailed || !storage) {
        confidenceNote = `${confidenceNote}${t('onboarding.storageNoteSuffix')}`
        setStatus(t('onboarding.storageWarn'))
      }

      const price = parseEuros(priceText, 400)
      const budget = parseEuros(budgetText, 250)
      setPriceText(String(price))
      setBudgetText(String(budget))

      const deviceInfo = deviceRaw
        ? toMeasuredInfo(deviceRaw, storage)
        : undefined

      onComplete({
        purchasePrice: price,
        nextBudget: budget,
        nextIntents: intents,
        utilization: measured.utilization,
        badges: measured.badges,
        dataSource: 'measured',
        historyDays: measured.historyDays,
        confidenceNote,
        storageUsedBytes: measured.storageUsedBytes,
        storageTotalBytes: measured.storageTotalBytes,
        deviceInfo,
      })
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : e instanceof Error
            ? e.message
            : t('onboarding.readError')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const sourceLabel =
    savedProfile?.dataSource === 'measured'
      ? t('onboarding.sourceMeasured')
      : savedProfile?.dataSource === 'demo'
        ? t('onboarding.sourceDemo')
        : t('onboarding.sourceSynthetic')

  return (
    <div className="app-screen mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-[max(2.5rem,var(--app-pad-bottom))]">
      <div className="mb-2 flex justify-end">
        <LanguageSwitcher compact />
      </div>
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
          <span className="text-2xl" aria-hidden>
            📱
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t('app.name')}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{t('app.tagline')}</p>
      </header>

      {savedProfile && onRestore && (
        <div className="mb-5 rounded-xl border border-brand-500/40 bg-brand-600/10 p-4">
          <p className="text-sm font-semibold text-brand-100">
            {t('onboarding.savedTitle')}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t('onboarding.savedMeta', {
              price: savedProfile.purchasePrice,
              source: sourceLabel,
              days:
                savedProfile.historyDays != null
                  ? t('onboarding.daysSuffix', {
                      days: savedProfile.historyDays,
                    })
                  : '',
            })}
          </p>
          <button
            type="button"
            onClick={onRestore}
            className="mt-3 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
          >
            {t('onboarding.restore')}
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            {t('onboarding.orRemeasure')}
          </p>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-1 flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">
            {t('onboarding.priceLabel')}
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-lg text-white outline-none ring-brand-500 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">
            {t('onboarding.budgetLabel')}
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={budgetText}
            onChange={(e) =>
              setBudgetText(e.target.value.replace(/[^0-9]/g, ''))
            }
            className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-lg text-white outline-none ring-brand-500 focus:ring-2"
          />
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-300">
            {t('onboarding.intentLegend')}
          </legend>
          <p className="mb-2 text-xs text-slate-500">
            {t('onboarding.intentHint')}
          </p>
          <div className="flex flex-wrap gap-2">
            {getIntentOptions().map((opt) => {
              const on = intents.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleIntent(opt.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    on
                      ? 'border-brand-500 bg-brand-600/25 text-white'
                      : 'border-slate-600 bg-slate-800/60 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        {native && (
          <div className="rounded-xl border border-brand-500/40 bg-brand-600/10 p-4">
            <p className="mb-2 text-sm font-semibold text-brand-200">
              {t('onboarding.nativeTitle')}
            </p>
            <p className="mb-3 text-xs text-slate-400">
              {t('onboarding.nativeHint')}
            </p>
            {usageGranted === false && (
              <button
                type="button"
                onClick={openUsageSettings}
                className="mb-2 w-full rounded-xl border border-amber-500/50 bg-amber-500/10 py-2.5 text-sm font-medium text-amber-200"
              >
                {t('onboarding.openUsage')}
              </button>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={readPhoneData}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {busy ? t('onboarding.reading') : t('onboarding.readData')}
              </button>
              <button
                type="button"
                onClick={refreshPermission}
                className="w-full rounded-lg py-1.5 text-xs text-slate-400 hover:text-white"
              >
                {t('onboarding.checkPerm')}
                {usageGranted === true
                  ? t('onboarding.permGranted')
                  : usageGranted === false
                    ? t('onboarding.permPending')
                    : ''}
              </button>
            </div>
            {status && (
              <p className="mt-2 text-xs text-emerald-300/90">{status}</p>
            )}
            {error && <p className="mt-2 text-xs text-orange-300">{error}</p>}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 active:scale-[0.98]"
          >
            {t('onboarding.calculate')}
          </button>
          <button
            type="button"
            onClick={loadDemo}
            className="w-full rounded-xl border border-dashed border-slate-500 py-3 text-sm font-medium text-slate-300 transition hover:border-brand-400 hover:text-white"
          >
            {t('onboarding.loadDemo')}
          </button>
          {!native && (
            <p className="text-center text-[11px] text-slate-500">
              {t('onboarding.browserOnly')}
            </p>
          )}
          <p className="pt-2 text-center text-[11px] text-slate-600">
            {t('app.name')} {APP_VERSION} ·{' '}
            <button
              type="button"
              onClick={() =>
                window.open(RELEASES_LATEST_URL, '_blank', 'noopener,noreferrer')
              }
              className="text-brand-400 hover:text-brand-300"
            >
              {t('app.checkUpdate')}
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
