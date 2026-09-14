import { useMemo } from 'react'
import type { UserProfile } from '../engine/types'
import { recommendPhones } from '../engine/recommend'
import { PHONE_CATALOG } from '../data/catalog'
import { TransparencyNote } from './TransparencyNote'

interface Props {
  profile: UserProfile
  onBack: () => void
}

export function Recommendations({ profile, onBack }: Props) {
  const recs = useMemo(
    () =>
      recommendPhones(
        PHONE_CATALOG,
        profile.nextBudget,
        profile.utilization,
        profile.usageType,
        3,
      ),
    [profile],
  )

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <header className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm text-brand-400 hover:text-brand-300"
        >
          ← Volver al panel
        </button>
        <h1 className="text-xl font-bold text-white">Recomendaciones</h1>
        <p className="text-sm text-slate-400">
          Top 3 segun tu uso real y presupuesto de{' '}
          <strong className="text-slate-200">{profile.nextBudget} €</strong>
        </p>
      </header>

      {recs.length === 0 ? (
        <div className="rounded-2xl border border-slate-600 bg-slate-800/60 p-6 text-center">
          <p className="text-slate-300">
            No hay móviles en el catalogo dentro de ese presupuesto. Prueba a
            subirlo un poco.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-sm text-brand-400"
          >
            Ajustar presupuesto
          </button>
        </div>
      ) : (
        <ol className="space-y-4">
          {recs.map((rec, i) => (
            <li
              key={rec.phone.id}
              className="overflow-hidden rounded-2xl border border-slate-600/80 bg-slate-800/70 shadow-lg"
            >
              <div className="flex items-center gap-2 border-b border-slate-700/80 bg-slate-900/40 px-4 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-brand-300">
                  {rec.fitLabel}
                </span>
                <span className="ml-auto text-xs tabular-nums text-slate-400">
                  Fit {Math.round(rec.fitScore)}%
                </span>
              </div>

              <div className="p-4">
                <p className="text-xs text-slate-400">{rec.phone.brand}</p>
                <h2 className="text-lg font-bold text-white">{rec.phone.name}</h2>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-900/60 px-2 py-2">
                    <p className="text-[10px] uppercase text-slate-500">Precio</p>
                    <p className="font-semibold text-white">
                      {rec.phone.priceEuro} €
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 px-2 py-2">
                    <p className="text-[10px] uppercase text-slate-500">Encaje</p>
                    <p className="font-semibold text-brand-300">
                      {Math.round(rec.fitScore)}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 px-2 py-2 ring-1 ring-emerald-500/20">
                    <p className="text-[10px] uppercase text-emerald-500/80">
                      Ahorro est.
                    </p>
                    <p className="font-semibold text-emerald-300">
                      {Math.round(rec.estimatedSavings)} €
                    </p>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {rec.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex gap-2 text-sm text-slate-300"
                    >
                      <span className="text-brand-400" aria-hidden>
                        ✓
                      </span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6">
        <TransparencyNote />
      </div>
    </div>
  )
}
