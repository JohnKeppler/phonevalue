import { useEffect, useState, type FormEvent } from 'react'
import type { NextIntent, UserProfile } from '../engine/types'
import { DEMO_PROFILE } from '../data/demo'
import { INTENT_OPTIONS } from '../data/intents'
import { isNativeAndroid, PhoneUsage } from '../native/phoneUsage'
import { mapUsageToUtilization } from '../engine/mapUsage'
import { APP_VERSION, RELEASES_LATEST_URL } from '../version'

interface Props {
  onComplete: (profile: UserProfile) => void
  savedProfile?: UserProfile | null
  onRestore?: () => void
}

export function Onboarding({ onComplete, savedProfile, onRestore }: Props) {
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
      setStatus(
        'Activa «ValorMóvil» en Acceso al uso y vuelve aquí. Luego pulsa Leer datos.',
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir Ajustes')
    }
  }

  async function refreshPermission() {
    try {
      const r = await PhoneUsage.isUsageAccessGranted()
      setUsageGranted(r.granted)
      setStatus(r.granted ? 'Permiso concedido. Ya puedes leer datos.' : null)
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
        setError(
          'Necesitas conceder Acceso al uso (Usage Access) en Ajustes del sistema.',
        )
        setBusy(false)
        return
      }

      let storageFailed = false
      const [summary, storage, signals] = await Promise.all([
        PhoneUsage.getUsageSummary({ rangeDays: 30 }),
        PhoneUsage.getStorageInfo().catch(() => {
          storageFailed = true
          return null
        }),
        PhoneUsage.getDeviceSignals().catch(() => null),
      ])

      const measured = mapUsageToUtilization(summary, storage, signals)

      let confidenceNote = measured.confidenceNote
      if (storageFailed || !storage) {
        confidenceNote =
          `${confidenceNote} Almacenamiento no se pudo leer; esa categoría queda estimada.`
        setStatus(
          'Aviso: no se pudo leer el almacenamiento. El resto se midió; Almacenamiento queda estimado.',
        )
      }

      const price = parseEuros(priceText, 400)
      const budget = parseEuros(budgetText, 250)
      setPriceText(String(price))
      setBudgetText(String(budget))

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
      })
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : e instanceof Error
            ? e.message
            : 'Error al leer datos del teléfono'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-screen mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-[max(2.5rem,var(--app-pad-bottom))]">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
          <span className="text-2xl" aria-hidden>
            📱
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ValorMóvil
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Descubre cuanto de tu teléfono aprovechas de verdad — y cuanto dinero
          se queda sin usar.
        </p>
      </header>

      {savedProfile && onRestore && (
        <div className="mb-5 rounded-xl border border-brand-500/40 bg-brand-600/10 p-4">
          <p className="text-sm font-semibold text-brand-100">
            Tienes un perfil guardado
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {savedProfile.purchasePrice} € ·{' '}
            {savedProfile.dataSource === 'measured'
              ? 'medido'
              : savedProfile.dataSource === 'demo'
                ? 'demo'
                : 'sintético'}
            {savedProfile.historyDays != null
              ? ` · ${savedProfile.historyDays} días`
              : ''}
          </p>
          <button
            type="button"
            onClick={onRestore}
            className="mt-3 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
          >
            Restaurar último perfil
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            O mide de nuevo abajo («Leer datos del teléfono» / calcular).
          </p>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-1 flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">
            Precio de compra de tu móvil actual (€)
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
            Presupuesto para el próximo móvil (€)
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-lg text-white outline-none ring-brand-500 focus:ring-2"
          />
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-300">
            Tipo de uso del próximo móvil
          </legend>
          <p className="mb-2 text-xs text-slate-500">
            Puedes marcar varios. No cambia la medición de tu móvil actual: solo
            ordena las recomendaciones. Si no marcas nada, seguimos tu uso, con
            un poco de margen.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTENT_OPTIONS.map((opt) => {
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
              Datos reales del teléfono (Android)
            </p>
            <p className="mb-3 text-xs text-slate-400">
              Lee UsageStats en el dispositivo. La lista de apps no se sube a
              ningún servidor.
            </p>
            {usageGranted === false && (
              <button
                type="button"
                onClick={openUsageSettings}
                className="mb-2 w-full rounded-xl border border-amber-500/50 bg-amber-500/10 py-2.5 text-sm font-medium text-amber-200"
              >
                Abrir ajustes de Acceso al uso
              </button>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={readPhoneData}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {busy ? 'Leyendo…' : 'Leer datos del teléfono'}
              </button>
              <button
                type="button"
                onClick={refreshPermission}
                className="w-full rounded-lg py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Comprobar permiso otra vez
                {usageGranted === true
                  ? ' · concedido ✓'
                  : usageGranted === false
                    ? ' · pendiente'
                    : ''}
              </button>
            </div>
            {status && (
              <p className="mt-2 text-xs text-emerald-300/90">{status}</p>
            )}
            {error && (
              <p className="mt-2 text-xs text-orange-300">{error}</p>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 active:scale-[0.98]"
          >
            Calcular mi aprovechamiento
          </button>
          <button
            type="button"
            onClick={loadDemo}
            className="w-full rounded-xl border border-dashed border-slate-500 py-3 text-sm font-medium text-slate-300 transition hover:border-brand-400 hover:text-white"
          >
            Cargar perfil demo (1000 € → ~31 %)
          </button>
          {!native && (
            <p className="text-center text-[11px] text-slate-500">
              En el navegador solo hay datos demo/sintéticos. Instala el APK
              Android para leer UsageStats reales.
            </p>
          )}
          <p className="pt-2 text-center text-[11px] text-slate-600">
            ValorMóvil {APP_VERSION} ·{' '}
            <button
              type="button"
              onClick={() =>
                window.open(RELEASES_LATEST_URL, '_blank', 'noopener,noreferrer')
              }
              className="text-brand-400 hover:text-brand-300"
            >
              Buscar actualización
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
