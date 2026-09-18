import type { DataSource } from '../engine/types'

interface Props {
  dataSource?: DataSource
  historyDays?: number
}

export function TransparencyNote({ dataSource, historyDays }: Props) {
  if (dataSource === 'measured') {
    return (
      <aside className="rounded-xl border border-emerald-600/40 bg-emerald-500/5 p-4 text-sm text-slate-400">
        <h3 className="mb-1 font-semibold text-emerald-200">
          Datos medidos en el dispositivo
        </h3>
        <p className="leading-relaxed">
          Esta sesión usa{' '}
          <code className="rounded bg-slate-700 px-1 text-xs text-brand-300">
            UsageStats
          </code>
          {historyDays != null ? ` (~${historyDays} días de historial)` : ''}{' '}
          y señales locales (almacenamiento, batería, red). Las categorías
          marcadas <strong className="text-emerald-300">medido</strong> vienen
          del teléfono; las{' '}
          <strong className="text-amber-300">estimado</strong> se infieren. Nada
          de la lista de apps se sube a un servidor.
        </p>
      </aside>
    )
  }

  return (
    <aside className="rounded-xl border border-slate-600/60 bg-slate-800/40 p-4 text-sm text-slate-400">
      <h3 className="mb-1 font-semibold text-slate-200">Nota de transparencia</h3>
      <p className="leading-relaxed">
        En la app Android nativa, ValorMóvil usa la API{' '}
        <code className="rounded bg-slate-700 px-1 text-xs text-brand-300">
          UsageStats
        </code>{' '}
        y señales del sistema para medir uso real. Esta vista usa{' '}
        <strong className="text-slate-300">
          {dataSource === 'demo' ? 'datos demo' : 'datos sintéticos'}
        </strong>{' '}
        — las cifras ilustran el concepto. Instala el APK para medir tu
        dispositivo.
      </p>
    </aside>
  )
}
