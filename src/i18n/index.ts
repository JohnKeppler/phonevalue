import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json' with { type: 'json' }
import en from './locales/en.json' with { type: 'json' }
import pt from './locales/pt.json' with { type: 'json' }
import it from './locales/it.json' with { type: 'json' }
import de from './locales/de.json' with { type: 'json' }

export const SUPPORTED_LANGS = ['es', 'en', 'pt', 'it', 'de'] as const
export type AppLang = (typeof SUPPORTED_LANGS)[number]

const LANG_KEY = 'valormovil.lang'

export function detectInitialLang(): AppLang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && (SUPPORTED_LANGS as readonly string[]).includes(saved)) {
      return saved as AppLang
    }
  } catch {
    /* ignore */
  }
  const nav =
    typeof navigator !== 'undefined'
      ? (navigator.language || 'es').slice(0, 2).toLowerCase()
      : 'es'
  if ((SUPPORTED_LANGS as readonly string[]).includes(nav)) return nav as AppLang
  return 'es'
}

export function persistLang(lang: AppLang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignore */
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
    it: { translation: it },
    de: { translation: de },
  },
  lng: detectInitialLang(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n
