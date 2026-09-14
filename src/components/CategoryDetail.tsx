import type { CategoryResult } from '../engine/types'

interface Props {
  category: CategoryResult
  onClose: () => void
}

export function CategoryDetail({ category, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-800 p-5 shadow-2xl"
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
              {category.badge === 'medido' ? 'Medido' : 'Estimado'}
            </span>
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

        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Peso" value={`${category.weight}%`} />
          <Stat label="Uso" value={`${category.utilization}%`} />
          <Stat label="Asignado" value={`${category.assignedEuro} €`} />
        </div>

        <div className="mb-4 flex justify-between rounded-xl bg-slate-900/60 px-3 py-2 text-sm">
          <span className="text-emerald-400">
            Aprovechado: {category.usedEuro} €
          </span>
          <span className="text-orange-400">
            Desperdicio: {category.wastedEuro} €
          </span>
        </div>

        <div className="rounded-xl border border-slate-600/80 bg-slate-900/40 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Cómo se calcula
          </h3>
          <p className="text-sm leading-relaxed text-slate-300">
            {category.howCalculated}
          </p>
        </div>
      </div>
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
