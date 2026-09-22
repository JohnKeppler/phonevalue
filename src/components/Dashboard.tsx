import { useEffect, useMemo, useState } from 'react'
import type { CategoryResult, UserProfile } from '../engine/types'
import { calculateUtilization } from '../engine/calculate'
import { budgetEnoughSentence } from '../engine/budgetEnough'
import { CATEGORIES } from '../engine/weights'
import { PHONE_CATALOG } from '../data/catalog'
import { intentLabel } from '../data/intents'
import { APP_VERSION, RELEASES_LATEST_URL } from '../version'
import { CategoryDetail } from './CategoryDetail'
import { TransparencyNote } from './TransparencyNote'
import { UsageCharts } from './UsageCharts'
import { pushBackHandler } from '../native/backStack'

interface Props {
  profile: UserProfile
  onShowRecs: () => void
  onReset: () => void
  onRemeasure: () => void
}

export function Dashboard({
  profile,
  onShowRecs,
  onReset,
  onRemeasure,
}: Props) {
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
  const intentText = profile.nextIntents.map(intentLabel).join(' · ')

  useEffect(() => {
    if (!selected) return
    return pushBackHandler(() => {
      setSelected(null)
      return true
    })
  }, [selected])

  const enoughSentence = useMemo(
    () =>
      budgetEnoughSentence(
        profile.utilization,
        PHONE_CATALOG,
        profile.nextIntents,
      ),
    [profile.utilization, profile.nextIntents],
  )

  const badgeSummary = useMemo(() => {
    let medido = 0
    let estimado = 0
    for (const cat of CATEGORIES) {
      const b = profile.badges?.[cat.id] ?? result.categories.find((c) => c.id === cat.id)?.badge
      if (b === 'medido') medido++
      else estimado++
    }
    return { medido, estimado }
  }, [profile.badges, result.categories])

  const thinHistory =
    profile.dataSource === 'measured' &&
    profile.historyDays != null &&
    profile.historyDays < 7
  const isSyntheticOrDemo =
    profile.dataSource === 'demo' || profile.dataSource === 'synthetic'

  function openUpdates() {
    window.open(RELEASES_LATEST_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="app-screen mx-auto max-w-lg px-4 pb-36">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400/90">
            Valor Móvil
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-white">
            Tu aprovechamiento
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {profile.purchasePrice} €
            {profile.dataSource === 'measured'
              ? ' · medido'
              : profile.dataSource === 'demo'
                ? ' · demo'
                : profile.dataSource === 'synthetic'
                  ? ' · sintético'
                  : ''}
          </p>
          {intentText && (
            <p className="mt-1 text-xs text-slate-500">
              Próximo móvil: {intentText}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={onRemeasure}
            className="min-h-11 rounded-xl border border-brand-500/40 bg-brand-600/15 px-3 py-2.5 text-sm font-semibold text-brand-100 hover:bg-brand-600/30 active:scale-[0.98]"
          >
            Volver a medir
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
          >
            Reiniciar
          </button>
        </div>
      </header>

      <ConfidenceBanner
        profile={profile}
        badgeSummary={badgeSummary}
        thinHistory={thinHistory}
        isSyntheticOrDemo={isSyntheticOrDemo}
      />

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
            <p className="text-xs text-emerald-400/80">Aprovechados</p>
            <p className="text-xl font-bold text-emerald-300">
              {Math.round(result.totalUsedEuro)} €
            </p>
          </div>
          <div className="rounded-xl bg-orange-500/10 px-3 py-3 ring-1 ring-orange-500/30">
            <p className="text-xs text-orange-400/80">Desperdiciados</p>
            <p className="text-xl font-bold text-orange-300">
              {Math.round(result.totalWastedEuro)} €
            </p>
          </div>
        </div>
      </section>

      <p className="mb-5 rounded-xl border border-brand-500/30 bg-brand-600/10 px-4 py-3 text-sm leading-relaxed text-brand-100">
        {enoughSentence}
      </p>

      <UsageCharts categories={result.categories} onSelect={setSelected} />

      <TransparencyNote
        dataSource={profile.dataSource}
        historyDays={profile.historyDays}
      />

      <footer className="mt-6 space-y-2 text-center text-[11px] text-slate-500">
        <button
          type="button"
          onClick={openUpdates}
          className="text-brand-400 hover:text-brand-300"
        >
          Buscar actualización
        </button>
        <p>
          Versión {APP_VERSION} · instala el APK nuevo encima del anterior
        </p>
      </footer>

      <div className="app-sticky-footer fixed inset-x-0 bottom-0 z-40 border-t border-slate-700/80 bg-slate-900/95 px-4 pt-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={onShowRecs}
            className="min-h-12 w-full rounded-xl bg-brand-600 px-3 py-3.5 text-base font-semibold leading-snug text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 active:scale-[0.98]"
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

function ConfidenceBanner({
  profile,
  badgeSummary,
  thinHistory,
  isSyntheticOrDemo,
}: {
  profile: UserProfile
  badgeSummary: { medido: number; estimado: number }
  thinHistory: boolean
  isSyntheticOrDemo: boolean
}) {
  if (profile.dataSource === 'measured') {
    return (
      <section
        className={`mb-5 rounded-2xl border p-4 ${
          thinHistory
            ? 'border-amber-500/50 bg-amber-500/10'
            : 'border-emerald-600/40 bg-emerald-500/10'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Confianza de la medición
        </p>
        <p className="mt-1 text-sm text-white">
          {profile.historyDays != null
            ? `${profile.historyDays} días de historial`
            : 'Historial desconocido'}
          {' · '}
          <span className="text-emerald-300">{badgeSummary.medido} medido</span>
          {' / '}
          <span className="text-amber-300">
            {badgeSummary.estimado} estimado
          </span>
        </p>
        {profile.confidenceNote && (
          <p className="mt-1 text-xs text-emerald-200/90">
            {profile.confidenceNote}
          </p>
        )}
        {thinHistory && (
          <p className="mt-2 text-xs font-medium text-amber-200">
            ⚠ Historial fino (menos de 7 días): las cifras pueden variar. Usa el móvil
            unos días más y vuelve a medir.
          </p>
        )}
      </section>
    )
  }

  if (isSyntheticOrDemo) {
    return (
      <section className="mb-5 rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
          Datos no medidos
        </p>
        <p className="mt-1 text-sm text-amber-50">
          Estás viendo un perfil{' '}
          <strong>{profile.dataSource === 'demo' ? 'demo' : 'sintético'}</strong>
          . No refleja tu uso real. En Android, usa «Leer datos del teléfono».
        </p>
      </section>
    )
  }

  return null
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
