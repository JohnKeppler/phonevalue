import { useMemo, useState } from 'react'
import type { CategoryResult, UserProfile } from '../engine/types'
import { calculateUtilization } from '../engine/calculate'
import { CategoryDetail } from './CategoryDetail'
import { TransparencyNote } from './TransparencyNote'
import { USAGE_LABELS } from '../data/demo'

interface Props {
  profile: UserProfile
  onShowRecs: () => void
  onReset: () => void
}

export function Dashboard({ profile, onShowRecs, onReset }: Props) {
  const result = useMemo(
    () =>
      calculateUtilization(
        profile.purchasePrice,
        profile.utilization,
        profile.badges,
      ),
    [profile],
  )
  const [selected, setSelected] = useState<CategoryResult | null>(null)

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-400">
            ValorMóvil
          </p>
          <h1 className="text-xl font-bold text-white">Tu aprovechamiento</h1>
          <p className="text-xs text-slate-400">
            {USAGE_LABELS[profile.usageType]} · {profile.purchasePrice} €
            {profile.dataSource === 'measured'
              ? ' · medido'
              : profile.dataSource === 'demo'
                ? ' · demo'
                : ''}
          </p>
          {profile.confidenceNote && (
            <p className="mt-1 text-[11px] text-emerald-400/90">
              {profile.confidenceNote}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          Reiniciar
        </button>
      </header>

      {/* Global S */}
      <section className="mb-5 overflow-hidden rounded-2xl border border-slate-600/80 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Utilización global</p>
            <p className="mt-1 text-5xl font-black tabular-nums tracking-tight text-white">
              {Math.round(result.globalS)}
              <span className="text-2xl text-slate-400">%</span>
            </p>
          </div>
          <Ring value={result.globalS} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-500/10 px-3 py-3 ring-1 ring-emerald-500/30">
            <p className="text-xs text-emerald-400/80">€ aprovechados</p>
            <p className="text-xl font-bold text-emerald-300">
              {Math.round(result.totalUsedEuro)} €
            </p>
          </div>
          <div className="rounded-xl bg-orange-500/10 px-3 py-3 ring-1 ring-orange-500/30">
            <p className="text-xs text-orange-400/80">€ desperdiciados</p>
            <p className="text-xl font-bold text-orange-300">
              {Math.round(result.totalWastedEuro)} €
            </p>
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="mb-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">
          Desglose por categoria
        </h2>
        <ul className="space-y-2">
          {result.categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setSelected(cat)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 p-3 text-left transition hover:border-brand-500/50 hover:bg-slate-800"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge kind={cat.badge} />
                    <span className="text-sm tabular-nums text-slate-300">
                      {cat.utilization}%
                    </span>
                  </span>
                </div>
                <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all"
                    style={{ width: `${cat.utilization}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{cat.usedEuro} € usados</span>
                  <span>{cat.wastedEuro} € desperdicio</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <TransparencyNote dataSource={profile.dataSource} historyDays={profile.historyDays} />

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-700/80 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={onShowRecs}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 active:scale-[0.98]"
          >
            Ver móviles que encajan · hasta {profile.nextBudget} €
          </button>
        </div>
      </div>

      {selected && (
        <CategoryDetail category={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function Badge({ kind }: { kind: 'medido' | 'estimado' }) {
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
        kind === 'medido'
          ? 'bg-emerald-500/20 text-emerald-300'
          : 'bg-amber-500/20 text-amber-300'
      }`}
    >
      {kind}
    </span>
  )
}

function Ring({ value }: { value: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100)
  return (
    <svg width="88" height="88" className="-rotate-90" aria-hidden>
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="#334155"
        strokeWidth="8"
      />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="url(#grad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a7ff5" />
          <stop offset="100%" stopColor="#33a1ff" />
        </linearGradient>
      </defs>
    </svg>
  )
}
