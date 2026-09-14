export function TransparencyNote() {
  return (
    <aside className="rounded-xl border border-slate-600/60 bg-slate-800/40 p-4 text-sm text-slate-400">
      <h3 className="mb-1 font-semibold text-slate-200">Nota de transparencia</h3>
      <p className="leading-relaxed">
        En un Android real, ValorMóvil usaria la API{' '}
        <code className="rounded bg-slate-700 px-1 text-xs text-brand-300">
          UsageStats
        </code>{' '}
        y señales del sistema para medir uso real. Esta version es un prototipo
        con <strong className="text-slate-300">datos demo</strong> y un motor
        de recomendacion local — las cifras ilustran el concepto, no miden tu
        dispositivo.
      </p>
    </aside>
  )
}
