import { useTranslation } from 'react-i18next'
import {
  SUPPORTED_LANGS,
  persistLang,
  type AppLang,
} from '../i18n'

interface Props {
  compact?: boolean
  className?: string
}

export function LanguageSwitcher({ compact, className = '' }: Props) {
  const { t, i18n } = useTranslation()
  const current = (SUPPORTED_LANGS as readonly string[]).includes(i18n.language)
    ? (i18n.language as AppLang)
    : ((i18n.language || 'es').slice(0, 2) as AppLang)

  function onChange(lang: AppLang) {
    void i18n.changeLanguage(lang)
    persistLang(lang)
  }

  return (
    <label
      className={`inline-flex items-center gap-2 text-xs text-slate-400 ${className}`}
    >
      {!compact && (
        <span className="font-medium uppercase tracking-wide">
          {t('app.language')}
        </span>
      )}
      <select
        aria-label={t('app.language')}
        value={(SUPPORTED_LANGS as readonly string[]).includes(current) ? current : 'es'}
        onChange={(e) => onChange(e.target.value as AppLang)}
        className="min-h-10 rounded-lg border border-slate-600 bg-slate-900/80 px-2 py-1.5 text-sm text-white outline-none ring-brand-500 focus:ring-2"
      >
        {SUPPORTED_LANGS.map((lang) => (
          <option key={lang} value={lang}>
            {t(`lang.${lang}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
