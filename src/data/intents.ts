import type { NextIntent } from '../engine/types'
import i18n from '../i18n'

export const INTENT_IDS: NextIntent[] = [
  'fotos',
  'video',
  'juegos',
  'whatsapp',
  'bateria',
  'almacenamiento',
]

export function getIntentOptions(): { id: NextIntent; label: string }[] {
  return INTENT_IDS.map((id) => ({
    id,
    label: i18n.t(`intents.${id}`),
  }))
}

/** @deprecated use getIntentOptions — kept for gradual migration */
export const INTENT_OPTIONS = INTENT_IDS.map((id) => ({
  id,
  label: id,
}))

export function intentLabel(id: NextIntent): string {
  return i18n.t(`intents.${id}`)
}
