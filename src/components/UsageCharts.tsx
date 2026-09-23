import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CategoryId, CategoryResult } from '../engine/types'

type ChartView = 'barras' | 'tarta' | 'mosaico'

const CATEGORY_COLORS: Record<CategoryId, string> = {
  soc: '#3b82f6',
  pantalla: '#8b5cf6',
  camara: '#ec4899',
  storage: '#f59e0b',
  ram: '#14b8a6',
  bateria: '#22c55e',
  conectividad: '#06b6d4',
  audio: '#f97316',
  sensores: '#a3e635',
  software: '#94a3b8',
}

interface Props {
  categories: CategoryResult[]
  onSelect: (category: CategoryResult) => void
}

export function UsageCharts({ categories, onSelect }: Props) {
  const { t } = useTranslation()
  const [view, setView] = useState<ChartView>('barras')
  const views: { id: ChartView; label: string }[] = [
    { id: 'barras', label: t('charts.bars') },
    { id: 'tarta', label: t('charts.pie') },
    { id: 'mosaico', label: t('charts.mosaic') },
  ]

  return (
    <section className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-300">
          {t('charts.breakdown')}
        </h2>
      </div>
      <div
        role="tablist"
        aria-label={t('charts.viewLabel')}
        className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-800/80 p-1"
      >
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              view === v.id
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'barras' && (
        <BarView categories={categories} onSelect={onSelect} />
      )}
      {view === 'tarta' && (
        <PieView categories={categories} onSelect={onSelect} />
      )}
      {view === 'mosaico' && (
        <MosaicView categories={categories} onSelect={onSelect} />
      )}
    </section>
  )
}

function BarView({ categories, onSelect }: Props) {
  const { t } = useTranslation()
  return (
    <ul className="space-y-2">
      {categories.map((cat) => (
        <li key={cat.id}>
          <button
            type="button"
            onClick={() => onSelect(cat)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 p-3 text-left transition hover:border-brand-500/50 hover:bg-slate-800"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: `linear-gradient(165deg, ${CATEGORY_COLORS[cat.id]} 0%, #0f172a 140%)`,
                  }}
                  aria-hidden
                />
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
                className="h-full rounded-full transition-all"
                style={{
                  width: `${cat.utilization}%`,
                  background: CATEGORY_COLORS[cat.id],
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{t('charts.usedEuro', { n: cat.usedEuro })}</span>
              <span>{t('charts.wastedEuro', { n: cat.wastedEuro })}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

function PieView({ categories, onSelect }: Props) {
  const { t } = useTranslation()
  const total = categories.reduce((s, c) => s + c.assignedEuro, 0) || 1
  const cx = 110
  const cy = 110
  const rOuter = 96
  const rInner = 58
  const sweeps = categories.map((cat) => (cat.assignedEuro / total) * 360)
  const slices = categories.map((cat, i) => {
    const start = sweeps.slice(0, i).reduce((sum, n) => sum + n, 0)
    const end = i === categories.length - 1 ? 360 : start + sweeps[i]
    return { cat, start, end }
  })

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 p-3">
      <svg
        viewBox="0 0 220 220"
        className="mx-auto w-full max-w-[240px]"
        role="img"
        aria-label={t('charts.pieAria')}
      >
        {slices.map(({ cat, start, end }) => (
          <path
            key={cat.id}
            d={donutSlice(cx, cy, rOuter, rInner, start, end)}
            fill={CATEGORY_COLORS[cat.id]}
            className="cursor-pointer outline-none"
            onClick={() => onSelect(cat)}
          >
            <title>
              {t('charts.sliceTitle', {
                label: cat.label,
                pct: cat.utilization,
                waste: cat.wastedEuro,
              })}
            </title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={rInner - 1} fill="#0f172a" />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-slate-400"
          fontSize="11"
        >
          {t('charts.weightEuro')}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-white"
          fontSize="13"
          fontWeight="700"
        >
          {t('charts.tenParts')}
        </text>
      </svg>
      <ul className="mt-2 grid grid-cols-2 gap-1.5">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => onSelect(cat)}
              className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-slate-700/60"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: CATEGORY_COLORS[cat.id] }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-xs text-slate-200">
                {cat.label}
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {cat.utilization}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MosaicView({ categories, onSelect }: Props) {
  const { t } = useTranslation()
  return (
    <ul className="grid grid-cols-2 gap-2">
      {categories.map((cat) => (
        <li key={cat.id}>
          <button
            type="button"
            onClick={() => onSelect(cat)}
            className="flex h-full w-full flex-col items-start justify-between rounded-xl p-3 text-left shadow-inner transition active:scale-[0.98]"
            style={{
              background: `linear-gradient(165deg, ${CATEGORY_COLORS[cat.id]} 0%, #0f172a 140%)`,
            }}
          >
            <span className="text-xs font-semibold leading-tight text-white drop-shadow">
              {cat.label}
            </span>
            <span className="mt-3 text-2xl font-black tabular-nums text-white drop-shadow">
              {cat.utilization}
              <span className="text-sm font-semibold">%</span>
            </span>
            <span className="mt-1 text-[11px] text-white/90">
              {t('charts.wastedEuro', { n: cat.wastedEuro })}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function Badge({ kind }: { kind: 'medido' | 'estimado' }) {
  const { t } = useTranslation()
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
        kind === 'medido'
          ? 'bg-emerald-500/20 text-emerald-300'
          : 'bg-amber-500/20 text-amber-300'
      }`}
    >
      {kind === 'medido' ? t('app.measured') : t('app.estimated')}
    </span>
  )
}

function donutSlice(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number,
): string {
  const sweep = Math.max(0, end - start)
  if (sweep >= 359.99) {
    return [
      circleArc(cx, cy, rOuter, 0, 180),
      circleArc(cx, cy, rOuter, 180, 360, true),
      circleArc(cx, cy, rInner, 360, 180, true),
      circleArc(cx, cy, rInner, 180, 0, true),
      'Z',
    ].join(' ')
  }
  const large = sweep > 180 ? 1 : 0
  const [ox1, oy1] = polar(cx, cy, rOuter, start)
  const [ox2, oy2] = polar(cx, cy, rOuter, end)
  const [ix1, iy1] = polar(cx, cy, rInner, end)
  const [ix2, iy2] = polar(cx, cy, rInner, start)
  return `M ${ox1} ${oy1} A ${rOuter} ${rOuter} 0 ${large} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${rInner} ${rInner} 0 ${large} 0 ${ix2} ${iy2} Z`
}

function circleArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
  cont = false,
): string {
  const [x1, y1] = polar(cx, cy, r, start)
  const [x2, y2] = polar(cx, cy, r, end)
  const move = cont ? `L ${x1} ${y1}` : `M ${x1} ${y1}`
  return `${move} A ${r} ${r} 0 1 1 ${x2} ${y2}`
}

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}
