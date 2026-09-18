import type { NextIntent } from '../engine/types'

export const INTENT_OPTIONS: { id: NextIntent; label: string }[] = [
  { id: 'fotos', label: 'Fotos' },
  { id: 'video', label: 'Vídeo' },
  { id: 'juegos', label: 'Juegos' },
  { id: 'whatsapp', label: 'WhatsApp / redes' },
  { id: 'bateria', label: 'Batería' },
  { id: 'almacenamiento', label: 'Almacenamiento' },
]

export function intentLabel(id: NextIntent): string {
  return INTENT_OPTIONS.find((o) => o.id === id)?.label ?? id
}
