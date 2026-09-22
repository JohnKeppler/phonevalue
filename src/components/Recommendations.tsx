import { useMemo, useState } from 'react'
import type { NextIntent, Recommendation, UserProfile } from '../engine/types'
import {
  candidateCategoryUtilization,
  candidateWastedEuro,
  recommendPhones,
} from '../engine/recommend'
import { CATEGORIES } from '../engine/weights'
import { usageSentence } from '../engine/specs'
import { PHONE_CATALOG } from '../data/catalog'
import { INTENT_OPTIONS } from '../data/intents'
import { TransparencyNote } from './TransparencyNote'

interface Props {
  profile: UserProfile
  onBack: () => void
  onIntentsChange: (intents: NextIntent[]) => void
}

export function Recommendations({ profile, onBack, onIntentsChange }: Props) {
  const [countText, setCountText] = useState('10')
  const [minText, setMinText] = useState('')
  const [maxText, setMaxText] = useState(String(profile.nextBudget))
  const [includeBrands, setIncludeBrands] = useState<string[]>([])
  const [excludeBrands, setExcludeBrands] = useState<string[]>([])
  const [selected, setSelected] = useState<Recommendation | null>(null)
  const [showSpecs, setShowSpecs] = useState(false)

  const brands = useMemo(() => {
    return [...new Set(PHONE_CATALOG.map((p) => p.brand))].sort((a, b) =>
      a.localeCompare(b, 'es'),
    )
  }, [])

  const topN = parseCount(countText)
  const minPrice = parseBound(minText)
  const maxPrice = parseBound(maxText)

  const recs = useMemo(
    () =>
      recommendPhones(PHONE_CATALOG, {
        utilization: profile.utilization,
        intents: profile.nextIntents,
        topN,
        minPrice,
        maxPrice,
        includeBrands,
        excludeBrands,
      }),
    [
      profile.utilization,
      profile.nextIntents,
      topN,
      minPrice,
      maxPrice,
      includeBrands,
      excludeBrands,
    ],
  )

  function toggleIntent(id: NextIntent) {
    const has = profile.nextIntents.includes(id)
    onIntentsChange(
      has
        ? profile.nextIntents.filter((x) => x !== id)
        : [...profile.nextIntents, id],
    )
  }

  function toggleInclude(brand: string) {
    setIncludeBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    )
    setExcludeBrands((prev) => prev.filter((b) => b !== brand))
  }

  function toggleExclude(brand: string) {
    setExcludeBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    )
    setIncludeBrands((prev) => prev.filter((b) => b !== brand))
  }

  function openPhone(rec: Recommendation) {
    setSelected(rec)
    setShowSpecs(false)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <header className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm text-brand-400 hover:text-brand-300"
        >
          ← Volver al panel
        </button>
        <h1 className="text-xl font-bold text-white">Recomendaciones</h1>
        <p className="text-sm text-slate-400">
          Encajan con tu uso medido
          {profile.nextIntents.length > 0 ? ' y con lo que quieres del próximo móvil' : ''}.
          Se actualizan al momento.
        </p>
      </header>

      <section className="mb-5 space-y-4 rounded-2xl border border-slate-700/80 bg-slate-800/50 p-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Cuántos móviles
          </p>
          <div className="mt-2 flex items-center gap-2">
            <CountChip
              label="5"
              on={countText === '5'}
              onClick={() => setCountText('5')}
            />
            <CountChip
              label="10"
              on={countText === '10'}
              onClick={() => setCountText('10')}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Número de móviles"
              value={countText}
              onChange={(e) =>
                setCountText(e.target.value.replace(/[^0-9]/g, ''))
              }
              className="w-16 rounded-lg border border-slate-600 bg-slate-900/70 px-2 py-1.5 text-center text-sm text-white outline-none ring-brand-500 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Precio (€)
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] text-slate-500">Mínimo</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minText}
                placeholder="sin mínimo"
                onChange={(e) =>
                  setMinText(e.target.value.replace(/[^0-9]/g, ''))
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none ring-brand-500 placeholder:text-slate-600 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-slate-500">
                Máximo
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxText}
                placeholder="sin máximo"
                onChange={(e) =>
                  setMaxText(e.target.value.replace(/[^0-9]/g, ''))
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none ring-brand-500 placeholder:text-slate-600 focus:ring-2"
              />
            </label>
          </div>
        </div>

        <BrandFilter
          title="Incluir marcas"
          hint="Vacío = todas"
          brands={brands}
          selected={includeBrands}
          onToggle={toggleInclude}
        />
        <BrandFilter
          title="Excluir marcas"
          hint="Se quitan aunque estén incluidas"
          brands={brands}
          selected={excludeBrands}
          onToggle={toggleExclude}
          tone="exclude"
        />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tipo de uso del próximo móvil
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTENT_OPTIONS.map((opt) => {
              const on = profile.nextIntents.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleIntent(opt.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    on
                      ? 'border-brand-500 bg-brand-600/25 text-white'
                      : 'border-slate-600 bg-slate-900/40 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <p className="mb-3 text-xs text-slate-500">
        {recs.length} {recs.length === 1 ? 'móvil' : 'móviles'}
        {maxPrice != null ? ` · hasta ${maxPrice} €` : ''}
      </p>

      {recs.length === 0 ? (
        <div className="rounded-2xl border border-slate-600 bg-slate-800/60 p-6 text-center">
          <p className="text-slate-300">
            Ningún móvil del catálogo pasa esos filtros. Prueba a ampliar el
            precio o quitar marcas.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {recs.map((rec, i) => (
            <li key={rec.phone.id}>
              <button
                type="button"
                onClick={() => openPhone(rec)}
                className="w-full overflow-hidden rounded-2xl border border-slate-600/80 bg-slate-800/70 text-left shadow-lg transition hover:border-brand-500/50"
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
                  <h2 className="text-lg font-bold text-white">
                    {rec.phone.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {rec.phone.priceEuro} €
                  </p>
                  <p className="mt-2 text-xs text-brand-300">
                    Toca para ver precio y euros desperdiciados
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6">
        <TransparencyNote />
      </div>

      {selected && (
        <PhonePanel
          rec={selected}
          utilization={profile.utilization}
          showSpecs={showSpecs}
          onShowSpecs={() => setShowSpecs(true)}
          onHideSpecs={() => setShowSpecs(false)}
          onClose={() => {
            setSelected(null)
            setShowSpecs(false)
          }}
        />
      )}
    </div>
  )
}

function PhonePanel({
  rec,
  utilization,
  showSpecs,
  onShowSpecs,
  onHideSpecs,
  onClose,
}: {
  rec: Recommendation
  utilization: UserProfile['utilization']
  showSpecs: boolean
  onShowSpecs: () => void
  onHideSpecs: () => void
  onClose: () => void
}) {
  const phone = rec.phone
  const waste = candidateWastedEuro(
    phone.priceEuro,
    utilization,
    phone.capabilities,
  )
  const perCat = candidateCategoryUtilization(utilization, phone.capabilities)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-panel-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-2xl border border-slate-600 bg-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
          <div>
            <p className="text-xs text-slate-400">{phone.brand}</p>
            <h2 id="phone-panel-title" className="text-lg font-bold text-white">
              {phone.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {showSpecs ? (
            <>
              <button
                type="button"
                onClick={onHideSpecs}
                className="mb-3 text-sm text-brand-400"
              >
                ← Precio y desperdiciado
              </button>
              <h3 className="text-base font-semibold text-white">
                Características
              </h3>
              <p className="mb-3 text-xs text-slate-400">
                Según tu uso, esto es lo que aprovecharías de cada parte.
              </p>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => {
                  const pct = perCat[cat.id]
                  return (
                    <li
                      key={cat.id}
                      className="rounded-xl border border-slate-700 bg-slate-900/50 p-3"
                    >
                      <p className="text-sm leading-relaxed text-slate-200">
                        {usageSentence(cat.id, phone.capabilities[cat.id], pct)}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Precio
              </p>
              <p className="text-3xl font-bold tabular-nums text-white">
                {phone.priceEuro} €
              </p>

              <div className="mt-4 rounded-2xl bg-orange-500/10 px-4 py-4 text-center ring-1 ring-orange-500/40">
                <p className="text-xs font-medium uppercase tracking-wide text-orange-300/90">
                  De ese precio quedarían desperdiciados
                </p>
                <p className="mt-1 text-5xl font-black tabular-nums text-orange-300">
                  {Math.round(waste)} €
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  de esos {phone.priceEuro} €, con tu uso actual
                </p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {rec.fitLabel} · fit {Math.round(rec.fitScore)}%
              </p>
              <ul className="mt-2 space-y-1">
                {rec.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-sm text-slate-300">
                    <span className="text-brand-400" aria-hidden>
                      ✓
                    </span>
                    {reason}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onShowSpecs}
                className="mt-4 w-full rounded-xl border border-brand-500/50 bg-brand-600/15 py-3 text-sm font-semibold text-brand-100"
              >
                Ver características
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CountChip({
  label,
  on,
  onClick,
}: {
  label: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm ${
        on
          ? 'border-brand-500 bg-brand-600/25 text-white'
          : 'border-slate-600 text-slate-300'
      }`}
    >
      {label}
    </button>
  )
}

function BrandFilter({
  title,
  hint,
  brands,
  selected,
  onToggle,
  tone = 'include',
}: {
  title: string
  hint: string
  brands: string[]
  selected: string[]
  onToggle: (brand: string) => void
  tone?: 'include' | 'exclude'
}) {
  const onClass =
    tone === 'exclude'
      ? 'border-orange-400/70 bg-orange-500/15 text-orange-100'
      : 'border-brand-500 bg-brand-600/25 text-white'
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mb-2 text-[11px] text-slate-500">{hint}</p>
      <div className="flex flex-wrap gap-1.5">
        {brands.map((brand) => {
          const on = selected.includes(brand)
          return (
            <button
              key={brand}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(brand)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                on ? onClass : 'border-slate-600 bg-slate-900/40 text-slate-300'
              }`}
            >
              {brand}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function parseBound(raw: string): number | undefined {
  const cleaned = raw.replace(/[^0-9]/g, '')
  if (cleaned === '') return undefined
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return undefined
  return n
}

function parseCount(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, '')
  if (cleaned === '') return 10
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(50, n)
}
