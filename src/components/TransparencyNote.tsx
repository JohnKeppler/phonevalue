import { useTranslation } from 'react-i18next'
import type { DataSource } from '../engine/types'

interface Props {
  dataSource?: DataSource
  historyDays?: number
}

export function TransparencyNote({ dataSource, historyDays }: Props) {
  const { t } = useTranslation()

  if (dataSource === 'measured') {
    const days =
      historyDays != null
        ? t('transparency.daysPart', { days: historyDays })
        : ''
    return (
      <aside className="space-y-3">
        <div className="rounded-xl border border-emerald-600/40 bg-emerald-500/5 p-4 text-sm text-slate-400">
          <h3 className="mb-1 font-semibold text-emerald-200">
            {t('transparency.measuredTitle')}
          </h3>
          <p
            className="leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: t('transparency.measuredBody', { days }),
            }}
          />
        </div>
        <p className="rounded-xl border border-slate-600/60 bg-slate-800/40 p-3 text-xs leading-relaxed text-slate-400">
          {t('transparency.catalogPrices')}
        </p>
      </aside>
    )
  }

  const source =
    dataSource === 'demo'
      ? t('transparency.demoData')
      : t('transparency.syntheticData')

  return (
    <aside className="space-y-3">
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/40 p-4 text-sm text-slate-400">
        <h3 className="mb-1 font-semibold text-slate-200">
          {t('transparency.noteTitle')}
        </h3>
        <p
          className="leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: t('transparency.noteBody', { source }),
          }}
        />
      </div>
      <p className="rounded-xl border border-slate-600/60 bg-slate-800/40 p-3 text-xs leading-relaxed text-slate-400">
        {t('transparency.catalogPrices')}
      </p>
    </aside>
  )
}
