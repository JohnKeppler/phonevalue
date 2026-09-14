import { useState } from 'react'
import type { UsageType, UserProfile } from '../engine/types'
import { DEMO_PROFILE, USAGE_HINTS, USAGE_LABELS } from '../data/demo'

interface Props {
  onComplete: (profile: UserProfile) => void
}

export function Onboarding({ onComplete }: Props) {
  const [price, setPrice] = useState(899)
  const [budget, setBudget] = useState(450)
  const [usage, setUsage] = useState<UsageType>('equilibrado')

  function loadDemo() {
    onComplete({ ...DEMO_PROFILE })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // Perfil sintetico segun tipo de uso (sin demo completo)
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
    })
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
            type="number"
            min={50}
            max={2500}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-lg text-white outline-none ring-brand-500 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">
            Presupuesto para el próximo móvil (€)
          </span>
          <input
            type="number"
            min={50}
            max={2500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
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
        </div>
      </form>
    </div>
  )
}
