import { useMemo } from 'react'
import type { Phone, UtilizationMap } from '../engine/types'
import {
  candidateCategoryUtilization,
  candidateWastedEuro,
} from '../engine/recommend'
import { CATEGORIES } from '../engine/weights'

interface Props {
  phones: Phone[]
  utilization: UtilizationMap
  onClose: () => void
}

export function CompareView({ phones, utilization, onClose }: Props) {
  const rows = useMemo(
    () =>
      phones.map((phone) => {
        const waste = candidateWastedEuro(
          phone.priceEuro,
          utilization,
          phone.capabilities,
        )
        const perCat = candidateCategoryUtilization(
          utilization,
          phone.capabilities,
        )
        return { phone, waste, perCat }
      }),
    [phones, utilization],
  )

  const cols = rows.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
          <h2 id="compare-title" className="text-lg font-bold text-white">
            Comparar ({cols})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto px-3 py-3">
          <table className="w-full min-w-[280px] border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-900 py-2 pr-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  —
                </th>
                {rows.map(({ phone }) => (
                  <th
                    key={phone.id}
                    className="px-1.5 py-2 align-bottom font-semibold text-white"
                  >
                    <span className="block text-[10px] font-normal text-slate-400">
                      {phone.brand}
                    </span>
                    {phone.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-700/80">
                <td className="sticky left-0 bg-slate-900 py-2 pr-2 text-slate-400">
                  Precio
                </td>
                {rows.map(({ phone }) => (
                  <td
                    key={phone.id}
                    className="px-1.5 py-2 font-bold tabular-nums text-white"
                  >
                    {phone.priceEuro} €
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-700/80">
                <td className="sticky left-0 bg-slate-900 py-2 pr-2 text-orange-300/90">
                  Desperdiciados
                </td>
                {rows.map(({ phone, waste }) => (
                  <td
                    key={phone.id}
                    className="px-1.5 py-2 font-bold tabular-nums text-orange-300"
                  >
                    {Math.round(waste)} €
                  </td>
                ))}
              </tr>
              {CATEGORIES.map((cat) => (
                <tr key={cat.id} className="border-t border-slate-800">
                  <td className="sticky left-0 bg-slate-900 py-1.5 pr-2 text-slate-500">
                    {cat.label}
                  </td>
                  {rows.map(({ phone, perCat }) => (
                    <td
                      key={phone.id}
                      className="px-1.5 py-1.5 tabular-nums text-slate-200"
                    >
                      {perCat[cat.id]}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            % = cuánto aprovecharías de cada categoría en ese móvil, con tu uso
            medido. Los euros desperdiciados usan el mismo motor que la ficha.
          </p>
        </div>
      </div>
    </div>
  )
}
