import { useEffect, useState } from 'react'
import type { UsageType, UserProfile } from '../engine/types'
import { DEMO_PROFILE, USAGE_HINTS, USAGE_LABELS } from '../data/demo'
import { isNativeAndroid, PhoneUsage } from '../native/phoneUsage'
import { mapUsageToUtilization } from '../engine/mapUsage'

interface Props {
  onComplete: (profile: UserProfile) => void
}

export function Onboarding({ onComplete }: Props) {
  const [priceText, setPriceText] = useState('400')
  const [budgetText, setBudgetText] = useState('250')
  const [usage, setUsage] = useState<UsageType>('equilibrado')
  const [native, setNative] = useState(false)
  const [usageGranted, setUsageGranted] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

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

  function loadDemo() {
    onComplete({ ...DEMO_PROFILE, dataSource: 'demo' })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseEuros(priceText, 400)
    const budget = parseEuros(budgetText, 250)
    setPriceText(String(price))
    setBudgetText(String(budget))
    const base = DEMO_PROFILE.utilization
    const factor =
      usage === 'ligero' ? 0.85 : usage === 'gaming-foto' ? 1.15 : 1
    const utilization = Object.fromEntries(
      Object.entries(base).map(([k, v]) => [
        k,
        Math.min(95, Math.round(v * factor)),
      ]),
    )
    onComplete({
      purchasePrice: price,
      nextBudget: budget,
      usageType: usage,
      utilization,
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

      const [summary, storage, signals] = await Promise.all([
        PhoneUsage.getUsageSummary({ rangeDays: 30 }),
        PhoneUsage.getStorageInfo().catch(() => null),
        PhoneUsage.getDeviceSignals().catch(() => null),
      ])

      const measured = mapUsageToUtilization(
        summary,
        storage,
        signals,
        usage,
      )

      const price = parseEuros(priceText, 400)
      const budget = parseEuros(budgetText, 250)
      setPriceText(String(price))
      setBudgetText(String(budget))

      onComplete({
        purchasePrice: price,
        nextBudget: budget,
        usageType: usage,
        utilization: measured.utilization,
        badges: measured.badges,
        dataSource: 'measured',
        historyDays: measured.historyDays,
        confidenceNote: measured.confidenceNote,
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
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-8">
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
          <legend className="mb-2 text-sm font-medium text-slate-300">
            Tipo de uso
          </legend>
          <div className="grid gap-2">
            {(Object.keys(USAGE_LABELS) as UsageType[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setUsage(key)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  usage === key
                    ? 'border-brand-500 bg-brand-600/20 shadow-inner'
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold text-white">
                  {USAGE_LABELS[key]}
                </div>
                <div className="text-xs text-slate-400">{USAGE_HINTS[key]}</div>
              </button>
            ))}
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
        </div>
      </form>
    </div>
  )
}
